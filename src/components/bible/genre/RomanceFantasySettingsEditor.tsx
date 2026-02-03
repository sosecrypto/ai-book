'use client'

import { useState } from 'react'
import type { RomanceFantasySettings, NobleFamily, RomanceRelationship } from '@/types/book-bible'
import { generateBibleItemId } from '@/types/book-bible'

interface Props {
  settings: RomanceFantasySettings
  onChange: (settings: RomanceFantasySettings) => void
}

type Section = 'families' | 'relationships' | 'hierarchy' | 'original'

export default function RomanceFantasySettingsEditor({ settings, onChange }: Props) {
  const [openSection, setOpenSection] = useState<Section | null>('families')
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const rankLabels: Record<NobleFamily['rank'], string> = {
    royal: '황족',
    duke: '공작',
    marquis: '후작',
    count: '백작',
    viscount: '자작',
    baron: '남작',
    knight: '기사',
  }

  const relationshipTypeLabels: Record<RomanceRelationship['type'], string> = {
    romantic: '연인',
    rival: '라이벌',
    friend: '친구',
    enemy: '적',
    family: '가족',
    unrequited: '짝사랑',
  }

  const stageLabels: Record<RomanceRelationship['stage'], string> = {
    strangers: '모르는 사이',
    acquaintance: '아는 사이',
    interest: '관심',
    tension: '긴장',
    confession: '고백',
    dating: '연인',
    engaged: '약혼',
    married: '결혼',
  }

  // Noble Families
  const addFamily = () => {
    const newItem: NobleFamily = {
      id: generateBibleItemId(),
      name: '',
      rank: 'count',
      description: '',
    }
    onChange({
      ...settings,
      nobleFamilies: [...settings.nobleFamilies, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateFamily = (id: string, updates: Partial<NobleFamily>) => {
    onChange({
      ...settings,
      nobleFamilies: settings.nobleFamilies.map(f =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })
  }

  const deleteFamily = (id: string) => {
    onChange({
      ...settings,
      nobleFamilies: settings.nobleFamilies.filter(f => f.id !== id),
    })
  }

  // Relationships
  const addRelationship = () => {
    const newItem: RomanceRelationship = {
      id: generateBibleItemId(),
      character1: '',
      character2: '',
      type: 'romantic',
      stage: 'strangers',
      description: '',
    }
    onChange({
      ...settings,
      relationships: [...settings.relationships, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateRelationship = (id: string, updates: Partial<RomanceRelationship>) => {
    onChange({
      ...settings,
      relationships: settings.relationships.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })
  }

  const deleteRelationship = (id: string) => {
    onChange({
      ...settings,
      relationships: settings.relationships.filter(r => r.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      {/* 귀족 가문 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('families')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            귀족 가문 ({settings.nobleFamilies.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'families' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'families' && (
          <div className="p-3 space-y-3">
            {settings.nobleFamilies.map(family => (
              <div key={family.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === family.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={family.name}
                      onChange={e => updateFamily(family.id, { name: e.target.value })}
                      placeholder="가문 이름 (예: 크로포드 가문)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <select
                      value={family.rank}
                      onChange={e => updateFamily(family.id, { rank: e.target.value as NobleFamily['rank'] })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      {Object.entries(rankLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={family.territory || ''}
                      onChange={e => updateFamily(family.id, { territory: e.target.value })}
                      placeholder="영지 (예: 북부 영지)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={family.reputation || ''}
                      onChange={e => updateFamily(family.id, { reputation: e.target.value })}
                      placeholder="평판 (예: 충직한 검의 가문)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={family.description}
                      onChange={e => updateFamily(family.id, { description: e.target.value })}
                      placeholder="가문 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteFamily(family.id)}
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
                  <div onClick={() => setEditingId(family.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{family.name || '(이름 없음)'}</span>
                      <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                        {rankLabels[family.rank]}
                      </span>
                    </div>
                    {family.territory && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">영지: {family.territory}</div>
                    )}
                    {family.reputation && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">&quot;{family.reputation}&quot;</div>
                    )}
                    {family.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{family.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addFamily}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 가문 추가
            </button>
          </div>
        )}
      </div>

      {/* 관계도 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('relationships')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            관계도 ({settings.relationships.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'relationships' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'relationships' && (
          <div className="p-3 space-y-3">
            {settings.relationships.map(rel => (
              <div key={rel.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === rel.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rel.character1}
                        onChange={e => updateRelationship(rel.id, { character1: e.target.value })}
                        placeholder="캐릭터 1"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <span className="flex items-center text-neutral-400">↔</span>
                      <input
                        type="text"
                        value={rel.character2}
                        onChange={e => updateRelationship(rel.id, { character2: e.target.value })}
                        placeholder="캐릭터 2"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={rel.type}
                        onChange={e => updateRelationship(rel.id, { type: e.target.value as RomanceRelationship['type'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        {Object.entries(relationshipTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <select
                        value={rel.stage}
                        onChange={e => updateRelationship(rel.id, { stage: e.target.value as RomanceRelationship['stage'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        {Object.entries(stageLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={rel.description}
                      onChange={e => updateRelationship(rel.id, { description: e.target.value })}
                      placeholder="관계 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <input
                      type="text"
                      value={rel.keyMoments?.join(', ') || ''}
                      onChange={e => updateRelationship(rel.id, { keyMoments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="주요 순간들 (쉼표 구분)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteRelationship(rel.id)}
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
                  <div onClick={() => setEditingId(rel.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {rel.character1 || '?'} ↔ {rel.character2 || '?'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        rel.type === 'romantic' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' :
                        rel.type === 'rival' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        rel.type === 'enemy' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {relationshipTypeLabels[rel.type]}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {stageLabels[rel.stage]}
                      </span>
                    </div>
                    {rel.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{rel.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addRelationship}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 관계 추가
            </button>
          </div>
        )}
      </div>

      {/* 원작 정보 (빙의물) */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('original')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            원작 정보 (빙의물)
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'original' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'original' && (
          <div className="p-3 space-y-3">
            <input
              type="text"
              value={settings.originalWork?.title || ''}
              onChange={e => onChange({
                ...settings,
                originalWork: { ...settings.originalWork, title: e.target.value },
              })}
              placeholder="원작 제목"
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
            <input
              type="text"
              value={settings.originalWork?.protagonist || ''}
              onChange={e => onChange({
                ...settings,
                originalWork: { ...settings.originalWork, protagonist: e.target.value },
              })}
              placeholder="원작 주인공"
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
            <input
              type="text"
              value={settings.originalWork?.currentCharacter || ''}
              onChange={e => onChange({
                ...settings,
                originalWork: { ...settings.originalWork, currentCharacter: e.target.value },
              })}
              placeholder="빙의된 캐릭터"
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
            <textarea
              value={settings.originalWork?.plotKnowledge?.join('\n') || ''}
              onChange={e => onChange({
                ...settings,
                originalWork: { ...settings.originalWork, plotKnowledge: e.target.value.split('\n').filter(Boolean) },
              })}
              placeholder="알고 있는 원작 전개 (줄바꿈으로 구분)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
            />
            <textarea
              value={settings.originalWork?.changedEvents?.join('\n') || ''}
              onChange={e => onChange({
                ...settings,
                originalWork: { ...settings.originalWork, changedEvents: e.target.value.split('\n').filter(Boolean) },
              })}
              placeholder="변경된 사건들 (줄바꿈으로 구분)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
