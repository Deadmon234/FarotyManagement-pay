'use client'

import { useState } from 'react'
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/topnav";
import { TrendingUp, Activity, BarChart3, ArrowUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCard {
  label: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [revenueFilter, setRevenueFilter]           = useState('month')
  const [hoveredDepositIndex,    setHoveredDepositIndex]    = useState<number | null>(null)
  const [hoveredWithdrawalIndex, setHoveredWithdrawalIndex] = useState<number | null>(null)
  const [hoveredBar, setHoveredBar] = useState<{ day: number; type: 'deposit' | 'withdrawal' | 'transfer' } | null>(null)

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)

  /* ── Revenue line chart data ── */
  const getRevenueData = () => {
    switch (revenueFilter) {
      case '7days': return {
        value: '3,250,000 XOF', change: '+8.2%', period: '7 derniers jours',
        deposits:    [450000, 520000, 380000, 610000, 490000, 580000, 720000],
        withdrawals: [320000, 280000, 410000, 350000, 440000, 390000, 480000],
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      }
      case 'year': return {
        value: '342,500,000 XOF', change: '+24.7%', period: 'cette année',
        deposits:    [18500000,22300000,19800000,26700000,24500000,28900000,31200000,29800000,33400000,35600000,34100000,37800000],
        withdrawals: [15600000,18900000,21200000,19800000,23400000,25600000,27800000,26500000,30100000,32300000,31200000,34500000],
        labels: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']
      }
      default: return {
        value: '28,750,000 XOF', change: '+18.4%', period: 'ce mois',
        deposits:    [2100000,2450000,1890000,3200000,2780000,3100000,2900000,3400000,2650000,3800000,4200000,3950000,3600000,4100000,3850000,4400000,4250000,4600000,4350000,4900000,4750000,5200000,5050000,5500000,5350000,5800000,5650000,6100000,5950000,6400000],
        withdrawals: [1800000,1650000,2100000,1950000,2300000,2150000,2500000,2350000,2700000,2550000,2900000,2750000,3100000,2950000,3300000,3150000,3500000,3350000,3700000,3550000,3900000,3750000,4100000,3950000,4300000,4150000,4500000,4350000,4700000,4550000],
        labels: Array.from({length: 30}, (_, i) => `${i + 1}`)
      }
    }
  }

  /* ── Transaction grouped bar data (7 jours × 3 types) ── */
  const txData = {
    labels:      ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    deposits:    [28, 41, 19, 35, 47, 62, 33],
    withdrawals: [14, 17, 16, 24, 16, 27, 21],
    transfers:   [ 8, 12,  9, 18, 12, 19, 13],
  }
  const txDayCount = txData.labels.length

  /* ── Line chart geometry ── */
  const W = 420, H = 220
  const PAD = { top: 20, right: 20, bottom: 30, left: 55 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const data   = getRevenueData()
  const maxVal = Math.max(...data.deposits, ...data.withdrawals)
  const n      = data.deposits.length

  const toX = (i: number) => PAD.left + (i / (n - 1)) * chartW
  const toY = (v: number) => PAD.top + chartH - (v / maxVal) * chartH * 0.92

  const buildPath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')

  const buildArea = (arr: number[]) => {
    const line = arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
    return `${line} L ${toX(n-1).toFixed(1)},${(PAD.top+chartH).toFixed(1)} L ${PAD.left},${(PAD.top+chartH).toFixed(1)} Z`
  }

  const yTicks = 5
  const formatShort = (v: number) => {
    if (v >= 1_000_000) return `${(v/1_000_000).toFixed(1)}M`
    if (v >= 1_000)     return `${(v/1_000).toFixed(0)}k`
    return `${v}`
  }

  const getTooltip = (idx: number | null, arr: number[], label: string) => {
    if (idx === null) return null
    return { x: toX(idx), y: toY(arr[idx]), value: arr[idx].toLocaleString('fr-FR') + ' XOF', day: data.labels[idx], label }
  }
  const depositTooltip    = getTooltip(hoveredDepositIndex,    data.deposits,    'Dépôts')
  const withdrawalTooltip = getTooltip(hoveredWithdrawalIndex, data.withdrawals, 'Retraits')

  /* ── Grouped bar chart geometry ── */
  const BW = 420, BH = 210
  const BPAD = { top: 20, right: 16, bottom: 32, left: 38 }
  const bW = BW - BPAD.left - BPAD.right
  const bH = BH - BPAD.top  - BPAD.bottom

  const maxTx  = Math.max(...txData.deposits, ...txData.withdrawals, ...txData.transfers)
  const groupW = bW / txDayCount
  const barGap = 2
  const barW   = (groupW - barGap * 4) / 3

  const bToY = (v: number) => BPAD.top + bH - (v / maxTx) * bH * 0.92
  const bToX = (dayIdx: number, barIdx: number) =>
    BPAD.left + dayIdx * groupW + barGap + barIdx * (barW + barGap)

  const BAR_COLORS = {
    deposit:    { fill: '#10b981', light: '#d1fae5', dark: '#064e3b', label: 'Dépôts' },
    withdrawal: { fill: '#ef4444', light: '#fee2e2', dark: '#7f1d1d', label: 'Retraits' },
    transfer:   { fill: '#8A56B2', light: '#ede9fe', dark: '#3b0764', label: 'Virements' },
  }

  const stats: StatCard[] = [
    { label: 'Nouveau wallet',         value: '125',             change: '+22.5%', icon: <Wallet size={24}/>,    color: 'from-blue-600 to-cyan-600' },
    { label: 'Paiement de la journée', value: '1,250,000 XOF',  change: '+8.7%',  icon: <TrendingUp size={24}/>, color: 'from-purple-600 to-pink-600' },
    { label: 'Transactions',           value: '342',             change: '+12.1%', icon: <Activity size={24}/>,   color: 'from-amber-600 to-orange-600' },
    { label: 'Revenu mensuel',         value: '28,750,000 XOF', change: '+18.4%', icon: <BarChart3 size={24}/>,  color: 'from-green-600 to-emerald-600' }
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-2">
                Tableau de bord
              </h1>
              <p className="text-gray-600">Bienvenue dans le panel d'administration de FAROTY</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200 hover:border-transparent overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}/>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
                        <ArrowUp size={16}/><span>{stat.change}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}/>
                </div>
              ))}
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* ── Revenu cumulé ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Revenu cumulé</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900">{data.value}</span>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                          <ArrowUpRight size={12}/>{data.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Sur {data.period}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {[{key:'7days',label:'7 jours'},{key:'month',label:'Ce mois'},{key:'year',label:'Année'}].map(f => (
                        <button key={f.key} onClick={() => setRevenueFilter(f.key)} style={{cursor:'pointer'}}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                            revenueFilter === f.key ? 'bg-[#8A56B2] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 mt-3">
                    <div className="flex items-center gap-1.5"><span className="w-8 h-0.5 bg-emerald-500 rounded-full inline-block"/><span className="text-xs text-gray-500">Dépôts</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-8 h-0.5 bg-red-400 rounded-full inline-block"/><span className="text-xs text-gray-500">Retraits</span></div>
                  </div>
                </div>

                <div className="px-2 py-3">
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible"
                       onMouseLeave={() => { setHoveredDepositIndex(null); setHoveredWithdrawalIndex(null) }}>
                    <defs>
                      <linearGradient id="gradDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.18"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="gradWithdrawal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12"/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {Array.from({length: yTicks+1}, (_,i) => {
                      const yPos = PAD.top + (i/yTicks)*chartH
                      return (
                        <g key={i}>
                          <line x1={PAD.left} y1={yPos} x2={PAD.left+chartW} y2={yPos} stroke={i===yTicks?'#d1d5db':'#f3f4f6'} strokeWidth={i===yTicks?1.5:1}/>
                          <text x={PAD.left-6} y={yPos+4} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="sans-serif">{formatShort(maxVal*(1-i/yTicks))}</text>
                        </g>
                      )
                    })}
                    {data.labels.map((lbl,i) => {
                      const step = Math.ceil(n/8)
                      if (i%step!==0 && i!==n-1) return null
                      return <text key={i} x={toX(i)} y={PAD.top+chartH+16} textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="sans-serif">{lbl}</text>
                    })}
                    <path d={buildArea(data.withdrawals)} fill="url(#gradWithdrawal)"/>
                    <path d={buildArea(data.deposits)}    fill="url(#gradDeposit)"/>
                    <path d={buildPath(data.withdrawals)} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    <path d={buildPath(data.deposits)}    fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                    {data.deposits.map((_,i) => (
                      <rect key={`hd-${i}`} x={toX(i)-(chartW/n/2)} y={PAD.top} width={chartW/n} height={chartH}
                            fill="transparent" style={{cursor:'crosshair'}}
                            onMouseEnter={() => { setHoveredDepositIndex(i); setHoveredWithdrawalIndex(null) }}/>
                    ))}
                    {data.withdrawals.map((_,i) => (
                      <rect key={`hw-${i}`} x={toX(i)-(chartW/n/2)} y={PAD.top} width={chartW/n} height={chartH}
                            fill="transparent" style={{cursor:'crosshair'}}
                            onMouseEnter={() => { setHoveredWithdrawalIndex(i); setHoveredDepositIndex(null) }}/>
                    ))}
                    {hoveredDepositIndex !== null && (
                      <>
                        <line x1={toX(hoveredDepositIndex)} y1={PAD.top} x2={toX(hoveredDepositIndex)} y2={PAD.top+chartH} stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
                        <circle cx={toX(hoveredDepositIndex)} cy={toY(data.deposits[hoveredDepositIndex])} r="5" fill="#10b981" stroke="white" strokeWidth="2"/>
                      </>
                    )}
                    {hoveredWithdrawalIndex !== null && (
                      <>
                        <line x1={toX(hoveredWithdrawalIndex)} y1={PAD.top} x2={toX(hoveredWithdrawalIndex)} y2={PAD.top+chartH} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
                        <circle cx={toX(hoveredWithdrawalIndex)} cy={toY(data.withdrawals[hoveredWithdrawalIndex])} r="5" fill="#ef4444" stroke="white" strokeWidth="2"/>
                      </>
                    )}
                    {depositTooltip && (() => {
                      const tx = Math.min(depositTooltip.x+10, W-105), ty = Math.max(depositTooltip.y-38, PAD.top)
                      return <g><rect x={tx} y={ty} width="100" height="32" rx="6" fill="#064e3b" opacity="0.92"/><text x={tx+8} y={ty+12} fontSize="9" fill="#6ee7b7" fontFamily="sans-serif">{depositTooltip.label} · {depositTooltip.day}</text><text x={tx+8} y={ty+24} fontSize="10" fill="white" fontFamily="sans-serif" fontWeight="600">{depositTooltip.value}</text></g>
                    })()}
                    {withdrawalTooltip && (() => {
                      const tx = Math.min(withdrawalTooltip.x+10, W-105), ty = Math.max(withdrawalTooltip.y-38, PAD.top)
                      return <g><rect x={tx} y={ty} width="100" height="32" rx="6" fill="#7f1d1d" opacity="0.92"/><text x={tx+8} y={ty+12} fontSize="9" fill="#fca5a5" fontFamily="sans-serif">{withdrawalTooltip.label} · {withdrawalTooltip.day}</text><text x={tx+8} y={ty+24} fontSize="10" fill="white" fontFamily="sans-serif" fontWeight="600">{withdrawalTooltip.value}</text></g>
                    })()}
                  </svg>
                </div>

                <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
                  <div className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><ArrowUpRight size={16} className="text-emerald-600"/></div>
                    <div><p className="text-xs text-gray-400">Total dépôts</p><p className="text-sm font-bold text-gray-800">{formatShort(data.deposits.reduce((a,b)=>a+b,0))} XOF</p></div>
                  </div>
                  <div className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><ArrowDownRight size={16} className="text-red-500"/></div>
                    <div><p className="text-xs text-gray-400">Total retraits</p><p className="text-sm font-bold text-gray-800">{formatShort(data.withdrawals.reduce((a,b)=>a+b,0))} XOF</p></div>
                  </div>
                </div>
              </div>

              {/* ── Transactions effectuées — grouped bar chart ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Transactions effectuées</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {[...txData.deposits,...txData.withdrawals,...txData.transfers].reduce((a,b)=>a+b,0)}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                          <ArrowUpRight size={12}/>+12.1%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">7 derniers jours · 3 types par jour</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#8A56B2]/10">
                      <Activity size={20} className="text-[#8A56B2]"/>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-5 mt-3">
                    {(Object.entries(BAR_COLORS) as [string, typeof BAR_COLORS['deposit']][]).map(([, c]) => (
                      <div key={c.label} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{background: c.fill}}/>
                        <span className="text-xs text-gray-500">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grouped bar SVG */}
                <div className="px-2 py-3">
                  <svg width="100%" viewBox={`0 0 ${BW} ${BH}`} className="overflow-visible"
                       onMouseLeave={() => setHoveredBar(null)}>

                    {/* Horizontal grid lines */}
                    {Array.from({length: 5}, (_,i) => {
                      const y = BPAD.top + (i/4)*bH
                      const v = Math.round(maxTx*(1-i/4))
                      return (
                        <g key={i}>
                          <line x1={BPAD.left} y1={y} x2={BPAD.left+bW} y2={y}
                                stroke={i===4?'#d1d5db':'#f3f4f6'} strokeWidth={i===4?1.5:1}/>
                          <text x={BPAD.left-5} y={y+4} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="sans-serif">{v}</text>
                        </g>
                      )
                    })}

                    {/* Day groups */}
                    {txData.labels.map((dayLabel, di) => {
                      type SeriesKey = 'deposit' | 'withdrawal' | 'transfer'
                      const series: Array<{ key: SeriesKey; val: number }> = [
                        { key: 'deposit',    val: txData.deposits[di] },
                        { key: 'withdrawal', val: txData.withdrawals[di] },
                        { key: 'transfer',   val: txData.transfers[di] },
                      ]
                      const anyHov   = hoveredBar?.day === di
                      const dayCenter = BPAD.left + di*groupW + groupW/2

                      return (
                        <g key={di}>
                          {/* Hover background for entire group */}
                          {anyHov && (
                            <rect
                              x={BPAD.left + di*groupW + barGap/2} y={BPAD.top - 4}
                              width={groupW - barGap} height={bH + 4}
                              fill="#f9fafb" rx="6"
                            />
                          )}

                          {/* 3 bars */}
                          {series.map(({ key, val }, bi) => {
                            const c     = BAR_COLORS[key]
                            const bx    = bToX(di, bi)
                            const barHt = (val / maxTx) * bH * 0.92
                            const by    = bToY(val)
                            const isHov = hoveredBar?.day === di && hoveredBar?.type === key

                            return (
                              <g key={key}
                                 onMouseEnter={() => setHoveredBar({ day: di, type: key })}
                                 onMouseLeave={() => setHoveredBar(null)}
                                 style={{ cursor: 'pointer' }}>
                                <rect
                                  x={bx} y={by} width={barW} height={barHt}
                                  fill={c.fill}
                                  opacity={isHov ? 1 : anyHov && !isHov ? 0.35 : 0.82}
                                  rx="3"
                                />
                                {/* Value above bar on hover */}
                                {isHov && (
                                  <text x={bx + barW/2} y={by - 5} textAnchor="middle"
                                        fontSize="10" fill={c.fill} fontWeight="700" fontFamily="sans-serif">
                                    {val}
                                  </text>
                                )}
                              </g>
                            )
                          })}

                          {/* Day label */}
                          <text x={dayCenter} y={BPAD.top + bH + 18} textAnchor="middle"
                                fontSize="10" fill={anyHov ? '#374151' : '#9ca3af'}
                                fontWeight={anyHov ? '700' : '400'} fontFamily="sans-serif">
                            {dayLabel}
                          </text>

                          {/* Thin separator between groups */}
                          {di < txDayCount - 1 && (
                            <line
                              x1={BPAD.left + (di+1)*groupW} y1={BPAD.top}
                              x2={BPAD.left + (di+1)*groupW} y2={BPAD.top + bH}
                              stroke="#f3f4f6" strokeWidth="1"
                            />
                          )}
                        </g>
                      )
                    })}

                    {/* Tooltip */}
                    {hoveredBar && (() => {
                      const { day: di, type: key } = hoveredBar
                      const val = key === 'deposit' ? txData.deposits[di] : key === 'withdrawal' ? txData.withdrawals[di] : txData.transfers[di]
                      const bi  = key === 'deposit' ? 0 : key === 'withdrawal' ? 1 : 2
                      const bx  = bToX(di, bi)
                      const by  = bToY(val)
                      const c   = BAR_COLORS[key]
                      const ttW = 122, ttH = 44
                      const ttX = Math.min(bx + barW + 5, BW - ttW - 4)
                      const ttY = Math.max(by - ttH / 2, BPAD.top)

                      return (
                        <g>
                          <rect x={ttX} y={ttY} width={ttW} height={ttH} rx="7" fill={c.dark} opacity="0.95"/>
                          <text x={ttX+9} y={ttY+15} fontSize="9" fill={c.light} fontFamily="sans-serif">
                            {txData.labels[di]} · {c.label}
                          </text>
                          <text x={ttX+9} y={ttY+31} fontSize="12" fill="white" fontWeight="700" fontFamily="sans-serif">
                            {val} opérations
                          </text>
                        </g>
                      )
                    })()}
                  </svg>
                </div>

                {/* Footer KPIs */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                  {[
                    { label: 'Dépôts',    total: txData.deposits.reduce((a,b)=>a+b,0),    color: 'text-emerald-600' },
                    { label: 'Retraits',  total: txData.withdrawals.reduce((a,b)=>a+b,0), color: 'text-red-500' },
                    { label: 'Virements', total: txData.transfers.reduce((a,b)=>a+b,0),   color: 'text-[#8A56B2]' },
                  ].map(k => (
                    <div key={k.label} className="px-4 py-3 text-center">
                      <p className={`text-base font-bold ${k.color}`}>{k.total}</p>
                      <p className="text-xs text-gray-400">{k.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
