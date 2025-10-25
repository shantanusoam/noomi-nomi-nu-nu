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
    parentLinks: Relationship[]
    childLinks: Relationship[]
    spouseLinks: Spouse[]
  }>
  onPersonClick?: (person: Person) => void
  className?: string
}

function TreeCanvasInner({ persons, onPersonClick, className }: TreeCanvasProps) {
  // Convert persons to React Flow format
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    return computeTreeLayout(persons)
  }, [persons])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges)

  // Update nodes when layout changes
  useMemo(() => {
    setNodes(layoutNodes)
    setEdges(layoutEdges)
  }, [layoutNodes, layoutEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const edgeTypes = useMemo(() => ({
    'parent-child': {
      style: { stroke: '#374151', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#374151',
      },
    },
    spouse: {
      style: { stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '5,5' },
    },
  }), [])

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
        edgeTypes={edgeTypes}
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
