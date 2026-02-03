'use client'

import { useState } from 'react'
import type { FantasySettings, MagicSystem, Race, Skill, PowerLevel } from '@/types/book-bible'
import { generateBibleItemId } from '@/types/book-bible'

interface Props {
  settings: FantasySettings
  onChange: (settings: FantasySettings) => void
}

type Section = 'magic' | 'races' | 'skills' | 'power' | 'artifacts'

export default function FantasySettingsEditor({ settings, onChange }: Props) {
  const [openSection, setOpenSection] = useState<Section | null>('magic')
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section)
  }

  // Magic Systems
  const addMagicSystem = () => {
    const newItem: MagicSystem = {
      id: generateBibleItemId(),
      name: '',
      source: '',
      ranks: [],
      description: '',
    }
    onChange({
      ...settings,
      magicSystems: [...settings.magicSystems, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateMagicSystem = (id: string, updates: Partial<MagicSystem>) => {
    onChange({
      ...settings,
      magicSystems: settings.magicSystems.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })
  }

  const deleteMagicSystem = (id: string) => {
    onChange({
      ...settings,
      magicSystems: settings.magicSystems.filter(m => m.id !== id),
    })
  }

  // Races
  const addRace = () => {
    const newItem: Race = {
      id: generateBibleItemId(),
      name: '',
      traits: [],
      description: '',
    }
    onChange({
      ...settings,
      races: [...settings.races, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateRace = (id: string, updates: Partial<Race>) => {
    onChange({
      ...settings,
      races: settings.races.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })
  }

  const deleteRace = (id: string) => {
    onChange({
      ...settings,
      races: settings.races.filter(r => r.id !== id),
    })
  }

  // Skills
  const addSkill = () => {
    const newItem: Skill = {
      id: generateBibleItemId(),
      name: '',
      type: 'active',
      description: '',
    }
    onChange({
      ...settings,
      skills: [...settings.skills, newItem],
    })
    setEditingId(newItem.id)
  }

  const updateSkill = (id: string, updates: Partial<Skill>) => {
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

  // Power Levels
  const addPowerLevel = () => {
    const newItem: PowerLevel = {
      id: generateBibleItemId(),
      rank: settings.powerLevels.length + 1,
      name: '',
      description: '',
    }
    onChange({
      ...settings,
      powerLevels: [...settings.powerLevels, newItem],
    })
    setEditingId(newItem.id)
  }

  const updatePowerLevel = (id: string, updates: Partial<PowerLevel>) => {
    onChange({
      ...settings,
      powerLevels: settings.powerLevels.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })
  }

  const deletePowerLevel = (id: string) => {
    onChange({
      ...settings,
      powerLevels: settings.powerLevels.filter(p => p.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      {/* 마법 체계 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('magic')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            마법 체계 ({settings.magicSystems.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'magic' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'magic' && (
          <div className="p-3 space-y-3">
            {settings.magicSystems.map(magic => (
              <div key={magic.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === magic.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={magic.name}
                      onChange={e => updateMagicSystem(magic.id, { name: e.target.value })}
                      placeholder="마법 체계 이름 (예: 서클 마법)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={magic.source}
                      onChange={e => updateMagicSystem(magic.id, { source: e.target.value })}
                      placeholder="마력 원천 (예: 마나, 오드)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={magic.ranks?.join(', ') || ''}
                      onChange={e => updateMagicSystem(magic.id, { ranks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="등급 (쉼표 구분: 1서클, 2서클, ...)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={magic.elements?.join(', ') || ''}
                      onChange={e => updateMagicSystem(magic.id, { elements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="원소 (쉼표 구분: 화염, 빙결, 뇌전)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={magic.description}
                      onChange={e => updateMagicSystem(magic.id, { description: e.target.value })}
                      placeholder="마법 체계 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteMagicSystem(magic.id)}
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
                  <div
                    onClick={() => setEditingId(magic.id)}
                    className="cursor-pointer"
                  >
                    <div className="font-medium text-neutral-900 dark:text-white">{magic.name || '(이름 없음)'}</div>
                    {magic.source && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">원천: {magic.source}</div>
                    )}
                    {magic.ranks && magic.ranks.length > 0 && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        등급: {magic.ranks.join(' → ')}
                      </div>
                    )}
                    {magic.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{magic.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addMagicSystem}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 마법 체계 추가
            </button>
          </div>
        )}
      </div>

      {/* 종족 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('races')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            종족 ({settings.races.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'races' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'races' && (
          <div className="p-3 space-y-3">
            {settings.races.map(race => (
              <div key={race.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                {editingId === race.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={race.name}
                      onChange={e => updateRace(race.id, { name: e.target.value })}
                      placeholder="종족 이름 (예: 엘프, 드워프)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={race.traits?.join(', ') || ''}
                      onChange={e => updateRace(race.id, { traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="특성 (쉼표 구분: 장수, 마법 친화력)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={race.abilities?.join(', ') || ''}
                      onChange={e => updateRace(race.id, { abilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="고유 능력 (쉼표 구분)"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      value={race.description}
                      onChange={e => updateRace(race.id, { description: e.target.value })}
                      placeholder="종족 설명"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => deleteRace(race.id)}
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
                  <div onClick={() => setEditingId(race.id)} className="cursor-pointer">
                    <div className="font-medium text-neutral-900 dark:text-white">{race.name || '(이름 없음)'}</div>
                    {race.traits && race.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {race.traits.map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {race.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{race.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addRace}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 종족 추가
            </button>
          </div>
        )}
      </div>

      {/* 스킬/능력 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            스킬/능력 ({settings.skills.length})
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
                        onChange={e => updateSkill(skill.id, { type: e.target.value as Skill['type'] })}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      >
                        <option value="active">액티브</option>
                        <option value="passive">패시브</option>
                        <option value="ultimate">궁극기</option>
                      </select>
                      <input
                        type="text"
                        value={skill.rank || ''}
                        onChange={e => updateSkill(skill.id, { rank: e.target.value })}
                        placeholder="등급 (S, A, B...)"
                        className="w-24 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
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
                      {skill.rank && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                          {skill.rank}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded">
                        {skill.type === 'active' ? '액티브' : skill.type === 'passive' ? '패시브' : '궁극기'}
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

      {/* 파워 레벨 */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('power')}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
        >
          <span className="font-medium text-neutral-900 dark:text-white">
            파워 레벨 ({settings.powerLevels.length})
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform ${openSection === 'power' ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSection === 'power' && (
          <div className="p-3 space-y-3">
            {settings.powerLevels
              .sort((a, b) => a.rank - b.rank)
              .map(level => (
                <div key={level.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                  {editingId === level.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={level.rank}
                          onChange={e => updatePowerLevel(level.id, { rank: parseInt(e.target.value) || 1 })}
                          placeholder="순서"
                          className="w-20 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={level.name}
                          onChange={e => updatePowerLevel(level.id, { name: e.target.value })}
                          placeholder="등급명 (예: 검성, 마스터)"
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        value={level.description}
                        onChange={e => updatePowerLevel(level.id, { description: e.target.value })}
                        placeholder="등급 설명"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => deletePowerLevel(level.id)}
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
                    <div onClick={() => setEditingId(level.id)} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                          {level.rank}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white">{level.name || '(이름 없음)'}</span>
                      </div>
                      {level.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 ml-8 line-clamp-2">{level.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            <button
              onClick={addPowerLevel}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-600 rounded hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              + 파워 레벨 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
