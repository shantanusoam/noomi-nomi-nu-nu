'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Person, Relationship, Spouse } from '@prisma/client'
import { computeTreeLayout, TreeNode, TreeEdge } from '@/lib/tree-layout'
import { nodeTypes } from './tree-node'

interface TreeCanvasProps {
  persons: Array<Person & {
    parentLinks?: Relationship[]
    childLinks?: Relationship[]
    spouseLinks?: Spouse[]
    spouseLinksA?: Spouse[]
    spouseLinksB?: Spouse[]
  }>
  onPersonClick?: (person: Person) => void
  className?: string
}


function TreeCanvasInner({ persons, onPersonClick, className }: TreeCanvasProps) {
  // Convert persons to React Flow format
  const { nodes: layoutNodes, edges: styledEdges } = useMemo(() => {
    const layout = computeTreeLayout(persons)
    // Add onPersonClick to person node data
    const nodesWithClickHandler = layout.nodes.map(node => {
      if (node.type === 'person' && node.data.person) {
        return {
          ...node,
          data: {
            ...node.data,
            onPersonClick,
          },
        }
      }
      return node
    })
    
    // Apply styles to edges based on their type
    const edgesWithStyles = layout.edges.map(edge => {
      if (edge.type === 'parent-child') {
        return {
          ...edge,
          style: { stroke: '#374151', strokeWidth: 2 },
          markerEnd: {
            type: 'arrowclosed' as const,
            color: '#374151',
          },
        }
      } else if (edge.type === 'spouse') {
        return {
          ...edge,
          style: { stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '5,5' },
        }
      }
      return edge
    })
    
    return { nodes: nodesWithClickHandler, edges: edgesWithStyles }
  }, [persons, onPersonClick])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges)

  // Update nodes when layout changes
  useMemo(() => {
    setNodes(layoutNodes)
    setEdges(styledEdges)
  }, [layoutNodes, styledEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const defaultEdgeOptions = useMemo(() => ({
    animated: false,
  }), [])

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'person') return '#3b82f6'
            return '#9ca3af'
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}

export function TreeCanvas(props: TreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <TreeCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
