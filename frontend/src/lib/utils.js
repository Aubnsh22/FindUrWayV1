import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getMatchColor(percentage) {
  if (percentage >= 75) return 'match-excellent'
  if (percentage >= 55) return 'match-good'
  if (percentage >= 35) return 'match-moderate'
  return 'match-low'
}

export function getMatchBgColor(percentage) {
  if (percentage >= 75) return 'match-bg-excellent'
  if (percentage >= 55) return 'match-bg-good'
  if (percentage >= 35) return 'match-bg-moderate'
  return 'match-bg-low'
}

export function formatSalary(min, max) {
  if (min && max) return `${(min/1000).toFixed(0)}k - ${(max/1000).toFixed(0)}k MAD`
  if (min) return `From ${(min/1000).toFixed(0)}k MAD`
  if (max) return `Up to ${(max/1000).toFixed(0)}k MAD`
  return null
}

export function timeAgo(dateStr) {
  if (!dateStr) return 'Recently'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const days = Math.floor(diffMs / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days/7)}w ago`
    return `${Math.floor(days/30)}mo ago`
  } catch {
    return 'Recently'
  }
}
