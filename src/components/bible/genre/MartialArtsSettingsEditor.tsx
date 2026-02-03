'use client'

import { useState } from 'react'
import type { MartialArtsSettings, InternalEnergy, MartialTechnique, Faction } from '@/types/book-bible'
import { generateBibleItemId } from '@/types/book-bible'

interface Props {
  settings: MartialArtsSettings
  onChange: (settings: MartialArtsSettings) => void
}

type Section = 'energy' | 'techniques' | 'factions' | 'ranks'

export default function MartialArtsSettingsEditor({ settings, onChange }: Props) {
  const [openSection, setOpenSection] = useState<Section | null>('techniques')
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section)
  }

  // Internal Energy (내공)
  const addInternalEnergy = () => {
    const newItem: InternalEnergy = {
      id: generateBibleItemId(),
      name: '',
      type: 'orthodox',
      description: '',
    }
    onChange({
      ...settings,
      internalEnergies: [...settings.internalEnergies, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateInternalEnergy = (id: string, updates: Partial<InternalEnergy>) => {
    onChange({
      ...settings,
      internalEnergies: settings.internalEnergies.map(e =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })
  }

  const deleteInternalEnergy = (id: string) => {
    onChange({
      ...settings,
      internalEnergies: settings.internalEnergies.filter(e => e.id !== id),
    })
  }

  // Martial Techniques (무공)
  const addTechnique = () => {
    const newItem: MartialTechnique = {
      id: generateBibleItemId(),
      name: '',
      type: 'sword',
      rank: 'first-class',
      description: '',
    }
    onChange({
      ...settings,
      techniques: [...settings.techniques, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateTechnique = (id: string, updates: Partial<MartialTechnique>) => {
    onChange({
      ...settings,
      techniques: settings.techniques.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })
  }

  const deleteTechnique = (id: string) => {
    onChange({
      ...settings,
      techniques: settings.techniques.filter(t => t.id !== id),
    })
  }

  // Factions (문파/세가)
  const addFaction = () => {
    const newItem: Faction = {
      id: generateBibleItemId(),
      name: '',
      type: 'sect',
      alignment: 'orthodox',
      description: '',
    }
    onChange({
      ...settings,
      factions: [...settings.factions, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateFaction = (id: string, updates: Partial<Faction>) => {
    onChange({
      ...settings,
      factions: settings.factions.map(f =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })
  }

  const deleteFaction = (id: string) => {
    onChange({
      ...settings,
      factions: settings.factions.filter(f => f.id !== id),
    })
  }

  const techniqueTypeLabels: Record<MartialTechnique['type'], string> = {
    fist: '권법',
    sword: '검법',
    saber: '도법',
    spear: '창법',
    palm: '장법',
    finger: '지법',
    leg: '각법',
    movement: '경공',
    hidden: '암기',
    other: '기타',
  }

  const rankLabels: Record<MartialTechnique['rank'], string> = {
    legendary: '절세무공',
    supreme: '절정무공',
    'first-class': '일류무공',
    'second-class': '이류무공',
    'third-class': '삼류무공',
  }

  const alignmentLabels: Record<Faction['alignment'], string> = {
    orthodox: '정파',
    unorthodox: '사파',
    neutral: '중립',
    evil: '마도',
  }

  return (
    <div className="space-y-4">
      {/* 무공 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('techniques')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            무공 ({settings.techniques.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'techniques' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'techniques' && (
          <div className="p-3 space-y-3">
            {settings.techniques.map(tech => (
              <div key={tech.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === tech.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tech.name}
                      onChange={e => updateTechnique(tech.id, { name: e.target.value })}
                      placeholder="무공 이름 (예: 태극검법)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={tech.type}
                        onChange={e => updateTechnique(tech.id, { type: e.target.value as MartialTechnique['type'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        {Object.entries(techniqueTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <select
                        value={tech.rank}
                        onChange={e => updateTechnique(tech.id, { rank: e.target.value as MartialTechnique['rank'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        {Object.entries(rankLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={tech.origin || ''}
                      onChange={e => updateTechnique(tech.id, { origin: e.target.value })}
                      placeholder="출처 (예: 무당파, 화산파)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={tech.moves?.join(', ') || ''}
                      onChange={e => updateTechnique(tech.id, { moves: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="초식 (쉼표 구분: 무극귀원, 태극혼일)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={tech.description}
                      onChange={e => updateTechnique(tech.id, { description: e.target.value })}
                      placeholder="무공 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteTechnique(tech.id)}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded"
                      >
                        완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingId(tech.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{tech.name || '(이름 없음)'}</span>
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                        {rankLabels[tech.rank]}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded">
                        {techniqueTypeLabels[tech.type]}
                      </span>
                    </div>
                    {tech.origin && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">출처: {tech.origin}</div>
                    )}
                    {tech.moves && tech.moves.length > 0 && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        초식: {tech.moves.join(', ')}
                      </div>
                    )}
                    {tech.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{tech.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addTechnique}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 무공 추가
            </button>
          </div>
        )}
      </div>

      {/* 문파/세가 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('factions')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            문파/세가 ({settings.factions.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'factions' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'factions' && (
          <div className="p-3 space-y-3">
            {settings.factions.map(faction => (
              <div key={faction.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === faction.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={faction.name}
                      onChange={e => updateFaction(faction.id, { name: e.target.value })}
                      placeholder="문파/세가 이름"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={faction.type}
                        onChange={e => updateFaction(faction.id, { type: e.target.value as Faction['type'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="sect">문파</option>
                        <option value="clan">세가</option>
                        <option value="organization">조직</option>
                        <option value="gang">방회</option>
                      </select>
                      <select
                        value={faction.alignment}
                        onChange={e => updateFaction(faction.id, { alignment: e.target.value as Faction['alignment'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        {Object.entries(alignmentLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={faction.leader || ''}
                      onChange={e => updateFaction(faction.id, { leader: e.target.value })}
                      placeholder="장문인/가주"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={faction.headquarters || ''}
                      onChange={e => updateFaction(faction.id, { headquarters: e.target.value })}
                      placeholder="본거지"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={faction.description}
                      onChange={e => updateFaction(faction.id, { description: e.target.value })}
                      placeholder="세력 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteFaction(faction.id)}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded"
                      >
                        완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingId(faction.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{faction.name || '(이름 없음)'}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        faction.alignment === 'orthodox' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        faction.alignment === 'unorthodox' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        faction.alignment === 'evil' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {alignmentLabels[faction.alignment]}
                      </span>
                    </div>
                    {faction.leader && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">수장: {faction.leader}</div>
                    )}
                    {faction.headquarters && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">본거지: {faction.headquarters}</div>
                    )}
                    {faction.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{faction.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addFaction}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 문파/세가 추가
            </button>
          </div>
        )}
      </div>

      {/* 내공 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('energy')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            내공심법 ({settings.internalEnergies.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'energy' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'energy' && (
          <div className="p-3 space-y-3">
            {settings.internalEnergies.map(energy => (
              <div key={energy.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === energy.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={energy.name}
                      onChange={e => updateInternalEnergy(energy.id, { name: e.target.value })}
                      placeholder="내공 이름 (예: 태극신공)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <select
                      value={energy.type}
                      onChange={e => updateInternalEnergy(energy.id, { type: e.target.value as InternalEnergy['type'] })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      <option value="orthodox">정파 내공</option>
                      <option value="unorthodox">사파 내공</option>
                      <option value="neutral">중립 내공</option>
                    </select>
                    <input
                      type="text"
                      value={energy.stages?.join(', ') || ''}
                      onChange={e => updateInternalEnergy(energy.id, { stages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="경지 (쉼표 구분: 1층, 2층, 대성)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={energy.description}
                      onChange={e => updateInternalEnergy(energy.id, { description: e.target.value })}
                      placeholder="내공 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteInternalEnergy(energy.id)}
                        className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded"
                      >
                        완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingId(energy.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{energy.name || '(이름 없음)'}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        energy.type === 'orthodox' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        energy.type === 'unorthodox' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {energy.type === 'orthodox' ? '정파' : energy.type === 'unorthodox' ? '사파' : '중립'}
                      </span>
                    </div>
                    {energy.stages && energy.stages.length > 0 && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        경지: {energy.stages.join(' → ')}
                      </div>
                    )}
                    {energy.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{energy.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addInternalEnergy}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 내공심법 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
