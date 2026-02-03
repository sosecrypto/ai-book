'use client'

import { useState } from 'react'
import type { HunterSettings, HunterRank, Gate, HunterSkill, Guild } from '@/types/book-bible'
import { generateBibleItemId } from '@/types/book-bible'

interface Props {
  settings: HunterSettings
  onChange: (settings: HunterSettings) => void
}

type Section = 'ranks' | 'gates' | 'skills' | 'guilds' | 'items'

export default function HunterSettingsEditor({ settings, onChange }: Props) {
  const [openSection, setOpenSection] = useState<Section | null>('ranks')
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section)
  }

  // Hunter Ranks
  const addHunterRank = () => {
    const newItem: HunterRank = {
      id: generateBibleItemId(),
      rank: settings.hunterRanks.length + 1,
      name: '',
      description: '',
    }
    onChange({
      ...settings,
      hunterRanks: [...settings.hunterRanks, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateHunterRank = (id: string, updates: Partial<HunterRank>) => {
    onChange({
      ...settings,
      hunterRanks: settings.hunterRanks.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })
  }

  const deleteHunterRank = (id: string) => {
    onChange({
      ...settings,
      hunterRanks: settings.hunterRanks.filter(r => r.id !== id),
    })
  }

  // Gates
  const addGate = () => {
    const newItem: Gate = {
      id: generateBibleItemId(),
      rank: 'C',
      type: 'dungeon',
      description: '',
    }
    onChange({
      ...settings,
      gates: [...settings.gates, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateGate = (id: string, updates: Partial<Gate>) => {
    onChange({
      ...settings,
      gates: settings.gates.map(g =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })
  }

  const deleteGate = (id: string) => {
    onChange({
      ...settings,
      gates: settings.gates.filter(g => g.id !== id),
    })
  }

  // Skills
  const addSkill = () => {
    const newItem: HunterSkill = {
      id: generateBibleItemId(),
      name: '',
      rank: 'Rare',
      type: 'offensive',
      description: '',
    }
    onChange({
      ...settings,
      skills: [...settings.skills, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateSkill = (id: string, updates: Partial<HunterSkill>) => {
    onChange({
      ...settings,
      skills: settings.skills.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })
  }

  const deleteSkill = (id: string) => {
    onChange({
      ...settings,
      skills: settings.skills.filter(s => s.id !== id),
    })
  }

  // Guilds
  const addGuild = () => {
    const newItem: Guild = {
      id: generateBibleItemId(),
      name: '',
      description: '',
    }
    onChange({
      ...settings,
      guilds: [...settings.guilds, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateGuild = (id: string, updates: Partial<Guild>) => {
    onChange({
      ...settings,
      guilds: settings.guilds.map(g =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })
  }

  const deleteGuild = (id: string) => {
    onChange({
      ...settings,
      guilds: settings.guilds.filter(g => g.id !== id),
    })
  }

  const skillTypeLabels: Record<HunterSkill['type'], string> = {
    offensive: '공격',
    defensive: '방어',
    support: '서포트',
    utility: '유틸',
    passive: '패시브',
  }

  return (
    <div className="space-y-4">
      {/* 헌터 등급 체계 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('ranks')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            헌터 등급 ({settings.hunterRanks.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'ranks' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'ranks' && (
          <div className="p-3 space-y-3">
            {settings.hunterRanks
              .sort((a, b) => a.rank - b.rank)
              .map(hunterRank => (
                <div key={hunterRank.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                  {editingId === hunterRank.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={hunterRank.rank}
                          onChange={e => updateHunterRank(hunterRank.id, { rank: parseInt(e.target.value) || 1 })}
                          placeholder="순서"
                          className="w-20 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={hunterRank.name}
                          onChange={e => updateHunterRank(hunterRank.id, { name: e.target.value })}
                          placeholder="등급명 (예: S급, A급)"
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={hunterRank.requirements || ''}
                        onChange={e => updateHunterRank(hunterRank.id, { requirements: e.target.value })}
                        placeholder="달성 조건"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={hunterRank.population || ''}
                        onChange={e => updateHunterRank(hunterRank.id, { population: e.target.value })}
                        placeholder="인원 수 (예: 전 세계 10명)"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <textarea
                        value={hunterRank.description}
                        onChange={e => updateHunterRank(hunterRank.id, { description: e.target.value })}
                        placeholder="등급 설명"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => deleteHunterRank(hunterRank.id)}
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
                    <div onClick={() => setEditingId(hunterRank.id)} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                          hunterRank.name?.includes('S') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          hunterRank.name?.includes('A') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                          hunterRank.name?.includes('B') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}>
                          {hunterRank.name?.charAt(0) || hunterRank.rank}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white">{hunterRank.name || '(이름 없음)'}</span>
                      </div>
                      {hunterRank.population && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-10">인원: {hunterRank.population}</div>
                      )}
                      {hunterRank.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 ml-10 line-clamp-2">{hunterRank.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            <button
              onClick={addHunterRank}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 등급 추가
            </button>
          </div>
        )}
      </div>

      {/* 게이트/던전 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('gates')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            게이트/던전 ({settings.gates.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'gates' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'gates' && (
          <div className="p-3 space-y-3">
            {settings.gates.map(gate => (
              <div key={gate.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === gate.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={gate.name || ''}
                      onChange={e => updateGate(gate.id, { name: e.target.value })}
                      placeholder="이름 (선택)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={gate.type}
                        onChange={e => updateGate(gate.id, { type: e.target.value as Gate['type'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="gate">게이트</option>
                        <option value="dungeon">던전</option>
                        <option value="rift">차원 균열</option>
                        <option value="tower">탑</option>
                      </select>
                      <input
                        type="text"
                        value={gate.rank}
                        onChange={e => updateGate(gate.id, { rank: e.target.value })}
                        placeholder="등급 (S, A, B...)"
                        className="w-24 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={gate.location || ''}
                      onChange={e => updateGate(gate.id, { location: e.target.value })}
                      placeholder="위치"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={gate.boss || ''}
                      onChange={e => updateGate(gate.id, { boss: e.target.value })}
                      placeholder="보스 몬스터"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={gate.description}
                      onChange={e => updateGate(gate.id, { description: e.target.value })}
                      placeholder="설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteGate(gate.id)}
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
                  <div onClick={() => setEditingId(gate.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        gate.rank?.includes('S') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        gate.rank?.includes('A') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {gate.rank}급
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {gate.name || `${gate.type === 'gate' ? '게이트' : gate.type === 'dungeon' ? '던전' : gate.type === 'tower' ? '탑' : '균열'}`}
                      </span>
                    </div>
                    {gate.location && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">위치: {gate.location}</div>
                    )}
                    {gate.boss && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">보스: {gate.boss}</div>
                    )}
                    {gate.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{gate.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addGate}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 게이트/던전 추가
            </button>
          </div>
        )}
      </div>

      {/* 스킬 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            스킬 ({settings.skills.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'skills' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'skills' && (
          <div className="p-3 space-y-3">
            {settings.skills.map(skill => (
              <div key={skill.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === skill.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={e => updateSkill(skill.id, { name: e.target.value })}
                      placeholder="스킬 이름"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={skill.type}
                        onChange={e => updateSkill(skill.id, { type: e.target.value as HunterSkill['type'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        {Object.entries(skillTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={skill.rank}
                        onChange={e => updateSkill(skill.id, { rank: e.target.value })}
                        placeholder="등급 (Unique, Legend...)"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={skill.obtainedFrom || ''}
                      onChange={e => updateSkill(skill.id, { obtainedFrom: e.target.value })}
                      placeholder="획득처"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={skill.description}
                      onChange={e => updateSkill(skill.id, { description: e.target.value })}
                      placeholder="스킬 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteSkill(skill.id)}
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
                  <div onClick={() => setEditingId(skill.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{skill.name || '(이름 없음)'}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        skill.rank?.toLowerCase().includes('unique') || skill.rank?.toLowerCase().includes('유니크') ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        skill.rank?.toLowerCase().includes('legend') || skill.rank?.toLowerCase().includes('레전') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {skill.rank}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {skillTypeLabels[skill.type]}
                      </span>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{skill.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addSkill}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 스킬 추가
            </button>
          </div>
        )}
      </div>

      {/* 길드 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('guilds')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            길드 ({settings.guilds.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'guilds' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'guilds' && (
          <div className="p-3 space-y-3">
            {settings.guilds.map(guild => (
              <div key={guild.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === guild.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={guild.name}
                      onChange={e => updateGuild(guild.id, { name: e.target.value })}
                      placeholder="길드 이름"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={guild.rank || ''}
                        onChange={e => updateGuild(guild.id, { rank: e.target.value })}
                        placeholder="길드 등급"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={guild.leader || ''}
                        onChange={e => updateGuild(guild.id, { leader: e.target.value })}
                        placeholder="길드장"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={guild.specialization || ''}
                      onChange={e => updateGuild(guild.id, { specialization: e.target.value })}
                      placeholder="전문 분야"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={guild.description}
                      onChange={e => updateGuild(guild.id, { description: e.target.value })}
                      placeholder="길드 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteGuild(guild.id)}
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
                  <div onClick={() => setEditingId(guild.id)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{guild.name || '(이름 없음)'}</span>
                      {guild.rank && (
                        <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                          {guild.rank}
                        </span>
                      )}
                    </div>
                    {guild.leader && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">길드장: {guild.leader}</div>
                    )}
                    {guild.specialization && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">전문: {guild.specialization}</div>
                    )}
                    {guild.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{guild.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addGuild}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 길드 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
