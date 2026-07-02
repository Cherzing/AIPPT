"use client";
import React, { useState } from 'react'
import { AlertTriangle, Trash } from 'lucide-react'
import { Theme } from '@/app/(presentation-generator)/services/api/types'
import ToolTip from '@/components/ToolTip'
import { FONT_OPTIONS } from './constants'

interface ThemeCardProps {
  theme: Theme
  onSelect: (theme: Theme) => void
  onDelete: (themeId: string) => void
  showDeleteButton?: boolean
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, onSelect, onDelete, showDeleteButton = true }) => {
  if (!theme.data.colors['graph_0']) return null
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fontDisplayName = FONT_OPTIONS.find(font => font.name === theme.data.fonts.textFont.name)?.displayName || theme.data.fonts.textFont.name

  return (
    <div
      className="group relative w-[305px] cursor-pointer rounded-xl border border-[#EDEEEF] bg-white transition-all hover:shadow-md"
      onClick={() => onSelect(theme)}
    >
      {showDeleteButton && (
        <button
          className="absolute -right-3 -top-3 z-10 hidden rounded-full border border-[#EDEEEF] bg-white p-2 transition-all duration-300 hover:bg-gray-100 hover:text-gray-700 group-hover:block"
          style={{ boxShadow: '0 6.6px 13.2px 0 rgba(0, 0, 0, 0.10)' }}
          aria-label="删除主题"
          onClick={(event) => {
            event.stopPropagation()
            setShowDeleteDialog(true)
          }}
        >
          <Trash className="h-3 w-3" />
        </button>
      )}

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_150ms_ease-out]"
          onClick={(event) => {
            event.stopPropagation()
            setShowDeleteDialog(false)
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative w-[340px] animate-[scaleIn_200ms_ease-out] rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-col items-center p-6 pb-4 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#191919]">删除主题？</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                你即将删除 <span className="font-medium text-gray-700">“{theme.name}”</span>。此操作无法撤销。
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-3.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDelete(theme.id)
                  setShowDeleteDialog(false)
                }}
                className="flex-1 border-l border-gray-100 px-4 py-3.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='relative flex h-[250px] items-center justify-center'>
        <img src="/card_bg.svg" alt="" className="absolute left-0 top-0 z-[1] h-full w-[99%] object-cover" />
        <div className="absolute left-0 top-0 z-[2] flex items-center justify-between gap-2 p-2">
          <ToolTip content='字体'>
            <p className="z-40 flex items-center gap-1 rounded-[100px] bg-[#3A3A3AF5] px-2.5 py-1 text-xs font-semibold text-white">
              {fontDisplayName}
            </p>
          </ToolTip>
          {theme.company_name && (
            <ToolTip content='公司'>
              <p className="z-40 overflow-hidden text-ellipsis whitespace-nowrap rounded-[100px] bg-[#3A3A3AF5] px-2.5 py-1 text-xs font-semibold text-white">
                {theme.company_name}
              </p>
            </ToolTip>
          )}
          {theme.logo_url && (
            <ToolTip content='标识'>
              <p className="z-40 rounded-[100px] bg-[#3A3A3AF5] px-2.5 py-1 text-xs font-semibold text-white">
                <img src={theme.logo_url} alt={theme.name} className="h-4 max-w-6 rounded-full object-cover" />
              </p>
            </ToolTip>
          )}
        </div>
        <div className="relative z-[3] px-6">
          <div className="h-[135px] w-full">
            <div className="h-full w-full rounded-xl border border-black/10 p-3" style={{ backgroundColor: theme.data.colors['background'] }}>
              <div className="mx-auto my-auto h-[calc(100%-2px)] w-[calc(100%-2px)] rounded-xl border border-black/10 p-4 shadow-[0_2px_6px_rgba(0,0,0,0.10)]" style={{ backgroundColor: theme.data.colors['background'] }}>
                <h4 className="truncate text-[16px] font-semibold" style={{ color: theme.data.colors['primary'], fontFamily: theme.data.fonts?.titleFont?.name || theme.data.fonts?.textFont?.name }}>
                  {theme.name}
                </h4>
                <p className="mt-1 text-sm" style={{ color: theme.data.colors['secondary'], fontFamily: theme.data.fonts?.textFont?.name }}>
                  选择你的偏好…
                </p>
                <div className="mt-4 h-3 w-20 rounded-full" style={{ backgroundColor: theme.data.colors['graph_0'] }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EDEEEF] bg-white px-5 py-4">
        <div className="mb-3 text-[16px] font-medium text-[#191919]">{theme.name}</div>
        <div className="flex items-center gap-2">
          {Object.values(theme.data.colors).slice(0, 2).map((color, index) => (
            <span key={index} className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: String(color) }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ThemeCard
