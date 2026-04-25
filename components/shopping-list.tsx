'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, ShoppingCart, Search, Filter, X, ChevronRight, Grape, Beef, Milk, Cookie, Settings2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  id: string
  text: string
  checked: boolean
  category: string
  quantity: string
  createdAt: number
}

const CATEGORIES = [
  { name: 'Geral', icon: ShoppingCart, color: 'bg-[#F9FAFB] text-[#101828]' },
  { name: 'Hortifruti', icon: Grape, color: 'bg-[#ECFDF3] text-[#027A48]' },
  { name: 'Açougue', icon: Beef, color: 'bg-[#FEF3F2] text-[#B42318]' },
  { name: 'Laticínios', icon: Milk, color: 'bg-[#F0F9FF] text-[#026AA2]' },
  { name: 'Padaria', icon: Cookie, color: 'bg-[#FFF9F5] text-[#C4320A]' },
]

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [inputText, setInputText] = useState('')
  const [inputQuantity, setInputQuantity] = useState('1')
  const [selectedCategory, setSelectedCategory] = useState('Geral')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [isMounted, setIsMounted] = useState(false)

  // Initialization
  useEffect(() => {
    const saved = localStorage.getItem('shopping-list-pro')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTimeout(() => setItems(parsed), 0)
      } catch (e) {
        console.error('Failed to load storage', e)
      }
    }
    setTimeout(() => setIsMounted(true), 0)
  }, [])

  // Sync with localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('shopping-list-pro', JSON.stringify(items))
    }
  }, [items, isMounted])

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      checked: false,
      category: selectedCategory,
      quantity: inputQuantity,
      createdAt: Date.now(),
    }

    setItems(prev => [newItem, ...prev])
    setInputText('')
    setInputQuantity('1')
  }

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.checked))
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      activeFilter === 'all' ? true :
      activeFilter === 'pending' ? !item.checked :
      item.checked
    return matchesSearch && matchesFilter
  })

  const pendingItems = filteredItems.filter(item => !item.checked).sort((a, b) => b.createdAt - a.createdAt)
  const completedItems = filteredItems.filter(item => item.checked).sort((a, b) => b.createdAt - a.createdAt)

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#1D2939] selection:bg-blue-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-[#EAECF0] py-8 px-6">
        <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 id="app-title" className="text-3xl font-bold tracking-tight text-[#101828]">Supermercado</h1>
            <p className="text-[#667085] text-sm mt-1">Lista Semanal • {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#F9FAFB] px-6 py-3 rounded-2xl border border-[#EAECF0] text-center min-w-[100px]">
              <p className="text-[10px] text-[#98A2B3] uppercase font-bold tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold text-[#101828]">{items.length}</p>
            </div>
            <div className="bg-[#ECFDF3] px-6 py-3 rounded-2xl border border-[#D1FADF] text-center min-w-[100px]">
              <p className="text-[10px] text-[#039855] uppercase font-bold tracking-wider mb-1">Pagos</p>
              <p className="text-2xl font-bold text-[#027A48]">{items.filter(i => i.checked).length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Input Card - Bento Block */}
        <section className="md:col-span-12 lg:col-span-8 bg-white rounded-[2rem] shadow-sm border border-[#EAECF0] p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F9FAFB] rounded-full flex items-center justify-center text-lg border border-[#EAECF0]">📝</div>
            <h2 className="text-xl font-bold text-[#101828]">Novo Item</h2>
          </div>

          <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                id="item-input"
                type="text"
                placeholder="O que você precisa comprar?"
                className="w-full bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-[#101828] placeholder:text-[#98A2B3]"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <input
                id="quantity-input"
                type="text"
                placeholder="Qtd"
                className="w-24 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl px-3 py-4 text-center outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-[#101828]"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value)}
              />
              <button
                id="add-button"
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[#101828] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-8 py-4 transition-all flex items-center justify-center gap-2 font-bold shadow-xl shadow-slate-200"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* Categories Selector */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#98A2B3] uppercase tracking-widest pl-1">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = selectedCategory === cat.name
                return (
                  <button
                    id={`cat-${cat.name.toLowerCase().replace(/ & /g, '-')}`}
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border text-sm font-bold",
                      isSelected 
                        ? "bg-[#101828] border-[#101828] text-white shadow-lg shadow-slate-200" 
                        : "bg-[#F9FAFB] border-[#EAECF0] hover:border-[#D0D5DD] text-[#475467]"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", !isSelected && cat.color.split(' ')[1])} />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Search & Filters - Side Bento Block */}
        <section className="md:col-span-12 lg:col-span-4 bg-white rounded-[2rem] border border-[#EAECF0] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F9FAFB] rounded-full flex items-center justify-center text-lg border border-[#EAECF0]">🔍</div>
            <h2 className="text-xl font-bold text-[#101828]">Filtros</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
            <input
              id="search-input"
              type="text"
              placeholder="Buscar..."
              className="w-full bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                id={`filter-${f}`}
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border",
                  activeFilter === f 
                    ? "bg-[#F9FAFB] border-[#EAECF0] text-[#101828] shadow-sm" 
                    : "bg-transparent border-transparent text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB]"
                )}
              >
                {f === 'all' ? 'Todos os Itens' : f === 'pending' ? 'Itens Pendentes' : 'Itens Comprados'}
              </button>
            ))}
          </div>
        </section>

        {/* List Section - Main Bento Block */}
        <section className="md:col-span-12 bg-white rounded-[2rem] border border-[#EAECF0] p-8 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#101828] rounded-full flex items-center justify-center text-lg border border-[#EAECF0]">🛒</div>
              <h2 className="text-xl font-bold text-[#101828]">Minha Lista</h2>
            </div>
            {items.some(i => i.checked) && (
              <button
                id="clear-completed"
                onClick={clearCompleted}
                className="text-xs font-bold text-[#B42318] bg-[#FEF3F2] hover:bg-[#FEE4E2] px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-[#FECDCA]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Comprados
              </button>
            )}
          </div>
          
          <div className="flex-1 space-y-10">
            <AnimatePresence initial={false} mode="popLayout">
              {pendingItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <h3 className="text-sm font-bold text-[#475467] uppercase tracking-widest">Pendentes ({pendingItems.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingItems.map((item) => (
                      <ShoppingItemCard 
                        key={item.id} 
                        item={item} 
                        toggleItem={toggleItem} 
                        deleteItem={deleteItem} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <h3 className="text-sm font-bold text-[#475467] uppercase tracking-widest">Comprados ({completedItems.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedItems.map((item) => (
                      <ShoppingItemCard 
                        key={item.id} 
                        item={item} 
                        toggleItem={toggleItem} 
                        deleteItem={deleteItem} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {items.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
                >
                  <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center border border-[#EAECF0] shadow-sm">
                    <Sparkles className="w-10 h-10 text-[#D0D5DD]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#101828]">Sua lista está vazia</h2>
                    <p className="text-[#667085] max-w-[240px] mt-1 text-sm">Comece adicionando itens que você precisa comprar no topo da página.</p>
                  </div>
                </motion.div>
              )}

              {items.length > 0 && pendingItems.length === 0 && completedItems.length === 0 && searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
                >
                  <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center border border-[#EAECF0]">🔍</div>
                  <div>
                    <h2 className="text-xl font-bold text-[#101828]">Nenhum item encontrado</h2>
                    <p className="text-[#667085] mt-1 text-sm">Tente buscar por um termo diferente.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-8 border-t border-[#EAECF0] flex items-center justify-between text-[#98A2B3]">
            <span className="text-xs font-bold uppercase tracking-widest">
              {filteredItems.length} de {items.length} itens mostrados
            </span>
          </div>
        </section>
      </main>

      {/* Floating Action Hint */}
      {items.length === 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#101828] text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl animate-bounce">
           Comece por aqui <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
         </div>
      )}
    </div>
  )
}

function ShoppingItemCard({ item, toggleItem, deleteItem }: { 
  item: ShoppingItem, 
  toggleItem: (id: string) => void, 
  deleteItem: (id: string) => void 
}) {
  const catInfo = CATEGORIES.find(c => c.name === item.category)
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group p-4 bg-[#F9FAFB] rounded-2xl border border-transparent hover:border-[#D0D5DD] transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md",
        item.checked && "opacity-60 bg-white border-[#EAECF0] shadow-none"
      )}
      onClick={() => toggleItem(item.id)}
    >
      <div
        id={`toggle-${item.id}`}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all",
          item.checked 
            ? "bg-[#101828] text-white" 
            : "bg-white border-2 border-[#D0D5DD] text-transparent"
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-bold text-[#101828] transition-all truncate",
          item.checked && "line-through text-[#98A2B3] font-medium"
        )}>
          {item.text}
        </h3>
        <div className="flex items-center gap-2 mt-1">
           <span className={cn(
             "text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider",
             catInfo?.color || "bg-slate-100 text-slate-500"
           )}>
             {item.category}
           </span>
           {item.quantity !== '1' && (
             <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-lg">
               {item.quantity} QTD
             </span>
           )}
        </div>
      </div>

      <button
        id={`delete-${item.id}`}
        onClick={(e) => {
          e.stopPropagation()
          deleteItem(item.id)
        }}
        className="opacity-0 group-hover:opacity-100 p-2 text-[#98A2B3] hover:text-[#B42318] hover:bg-[#FEF3F2] rounded-xl transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

