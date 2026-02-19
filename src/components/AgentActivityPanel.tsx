'use client'

import { AgentType, AgentMessage } from '@/types/book'

const agentInfo: Record<AgentType, { name: string; emoji: string; bgColor: string; textColor: string; borderColor: string }> = {
  research: {
    name: 'Research Agent',
    emoji: '🔍',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  outliner: {
    name: 'Outliner Agent',
    emoji: '📋',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  writer: {
    name: 'Writer Agent',
    emoji: '✍️',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  editor: {
    name: 'Editor Agent',
    emoji: '📝',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  critic: {
    name: 'Critic Agent',
    emoji: '⭐',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
  'editor-critic': {
    name: 'Editor-Critic Agent',
    emoji: '📝⭐',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
}

interface AgentActivityPanelProps {
  currentAgent: AgentType | null
  messages: AgentMessage[]
  isProcessing: boolean
}

export default function AgentActivityPanel({
  currentAgent,
  messages,
  isProcessing,
}: AgentActivityPanelProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">AI Agent Activity</h2>
        {isProcessing && (
          <span className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Processing
          </span>
        )}
      </div>

      {/* Current Agent Indicator */}
      {currentAgent && (
        <div
          className={`
            p-4 rounded-xl mb-6 border-2 transition-all duration-300
            ${agentInfo[currentAgent].bgColor}
            ${agentInfo[currentAgent].borderColor}
          `}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-bounce">{agentInfo[currentAgent].emoji}</div>
            <div>
              <div className={`font-semibold ${agentInfo[currentAgent].textColor}`}>
                {agentInfo[currentAgent].name}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <span className="inline-flex">
                  <span className="animate-pulse">Working</span>
                  <span className="animate-[pulse_1s_ease-in-out_0.2s_infinite]">.</span>
                  <span className="animate-[pulse_1s_ease-in-out_0.4s_infinite]">.</span>
                  <span className="animate-[pulse_1s_ease-in-out_0.6s_infinite]">.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message History */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
            <div className="text-4xl mb-2">🤖</div>
            <p>Waiting for AI agents to start...</p>
          </div>
        ) : (
          [...messages].reverse().map((msg, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border transition-all duration-300
                ${agentInfo[msg.agent].bgColor}
                ${agentInfo[msg.agent].borderColor}
                ${index === 0 ? 'animate-fadeIn' : ''}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{agentInfo[msg.agent].emoji}</span>
                <span className={`text-sm font-medium ${agentInfo[msg.agent].textColor}`}>
                  {agentInfo[msg.agent].name}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
                  {msg.type === 'thinking' ? '💭' : msg.type === 'feedback' ? '💬' : '✅'}
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 pl-7">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
