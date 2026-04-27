'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, ShoppingCart, Search, Filter, X, ChevronRight, Grape, Beef, Milk, Cookie, Settings2, Sparkles, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  id: string
  text: string
  checked: boolean
  isFavorite?: boolean
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

const CATALOG_ITEMS: Record<string, string[]> = {
  'Hortifruti': ['Abacate', 'Abacaxi', 'Alface', 'Banana', 'Batata', 'Cebola', 'Cenoura', 'Laranja', 'Maçã', 'Melancia', 'Ovos', 'Tomate'].sort(),
  'Açougue': ['Carne Moída', 'Frango', 'Linguiça', 'Peito de Frango', 'Peito de Peru', 'Salsicha'].sort(),
  'Laticínios': ['Iogurte', 'Leite', 'Manteiga', 'Queijo', 'Requeijão'].sort(),
  'Padaria': ['Pão de Forma', 'Pão Francês', 'Torrada'].sort(),
  'Geral': ['Arroz', 'Açúcar', 'Café', 'Cereal', 'Feijão', 'Macarrão', 'Molho de Tomate', 'Óleo', 'Sal', 'Sabonete', 'Shampoo', 'Detergente'].sort()
}

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [catalog, setCatalog] = useState<Record<string, string[]>>(CATALOG_ITEMS)
  const [inputText, setInputText] = useState('')
  const [inputQuantity, setInputQuantity] = useState('1')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showInputSection, setShowInputSection] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Initialization
  useEffect(() => {
    const savedItems = localStorage.getItem('shopping-list-pro')
    const savedCatalog = localStorage.getItem('shopping-list-catalog')
    
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems)
        setTimeout(() => setItems(parsed), 0)
      } catch (e) {
        console.error('Failed to load items', e)
      }
    }

    if (savedCatalog) {
      try {
        const parsed = JSON.parse(savedCatalog)
        setTimeout(() => setCatalog(parsed), 0)
      } catch (e) {
        console.error('Failed to load catalog', e)
      }
    }

    setTimeout(() => setIsMounted(true), 0)
  }, [])

  // Sync with localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('shopping-list-pro', JSON.stringify(items))
      localStorage.setItem('shopping-list-catalog', JSON.stringify(catalog))
    }
  }, [items, catalog, isMounted])

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const name = inputText.trim()
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      text: name,
      checked: false,
      isFavorite: false,
      category: 'Geral',
      quantity: inputQuantity,
      createdAt: Date.now(),
    }

    setItems(prev => [newItem, ...prev])

    // Dynamic catalog update
    const exists = Object.values(catalog).some(catItems => 
      catItems.some(item => item.toLowerCase() === name.toLowerCase())
    )

    if (!exists) {
      setCatalog(prev => ({
        ...prev,
        'Geral': [...prev['Geral'], name].sort()
      }))
    }

    setInputText('')
    setInputQuantity('1')
  }

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const toggleFavorite = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ))
  }

  const addFromCatalog = useCallback((text: string, category: string) => {
    setItems(prev => {
      if (prev.some(i => i.text.toLowerCase() === text.toLowerCase())) {
        return prev
      }

      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        text: text,
        checked: false,
        isFavorite: false,
        category: category,
        quantity: '1',
        createdAt: Date.now(),
      }
      return [newItem, ...prev]
    })
  }, [])

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.checked))
  }

  const filteredItems = items.filter(item => 
    showFavoritesOnly ? item.isFavorite : true
  )

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
          <button
            onClick={() => setShowInputSection(!showInputSection)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all border",
              showInputSection 
                ? "bg-[#101828] border-[#101828] text-white shadow-lg" 
                : "bg-[#F9FAFB] border-[#EAECF0] text-[#475467] hover:border-[#D0D5DD]"
            )}
          >
            <Plus className={cn("w-4 h-4 transition-transform", !showInputSection && "rotate-45")} />
            {showInputSection ? 'Fechar Novo Item' : 'Abrir Novo Item'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Input Card - Bento Block */}
        <AnimatePresence>
          {showInputSection && (
            <motion.section 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-white rounded-[2rem] shadow-sm border border-[#EAECF0] p-8 space-y-6 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F9FAFB] rounded-full flex items-center justify-center text-lg border border-[#EAECF0]">📝</div>
                  <h2 className="text-xl font-bold text-[#101828]">Novo Item</h2>
                </div>
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
            </motion.section>
          )}
        </AnimatePresence>

        {/* Catalog Section - Always Visible */}
        <section className="overflow-hidden">
          <div className="bg-white rounded-[2rem] border border-[#EAECF0] p-8 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5F3FF] rounded-full flex items-center justify-center text-lg border border-[#EDE9FE]">✨</div>
                <h2 className="text-xl font-bold text-[#101828]">Sugestões de Compras</h2>
              </div>
              <p className="text-sm text-[#667085] hidden sm:block">Toque em um item para adicionar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(catalog).map(([category, itemsList]) => {
                const catInfo = CATEGORIES.find(c => c.name === category);
                const CategoryIcon = catInfo?.icon || ShoppingCart;
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                       <CategoryIcon className={cn("w-4 h-4", catInfo?.color.split(' ')[1])} />
                       <h3 className="font-bold text-[#101828] text-sm uppercase tracking-wider">{category}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {itemsList.map((itemText) => {
                        const isAdded = items.some(i => i.text.toLowerCase() === itemText.toLowerCase());
                        return (
                          <button
                            key={itemText}
                            onClick={() => addFromCatalog(itemText, category)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                              isAdded 
                                ? "bg-[#ECFDF3] border-[#D1FADF] text-[#027A48] cursor-default" 
                                : "bg-[#F9FAFB] border-[#EAECF0] text-[#475467] hover:border-[#D0D5DD] hover:bg-white active:scale-95"
                            )}
                          >
                            {isAdded && <span className="mr-1">✓</span>}
                            {itemText}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* List Section - Main Bento Block */}
        <section className="bg-white rounded-[2rem] border border-[#EAECF0] p-8 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#101828] rounded-full flex items-center justify-center text-lg border border-[#EAECF0]">🛒</div>
              <h2 className="text-xl font-bold text-[#101828]">Minha Lista</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                  showFavoritesOnly 
                    ? "bg-amber-50 border-amber-200 text-amber-600" 
                    : "bg-[#F9FAFB] border-[#EAECF0] text-[#475467]"
                )}
              >
                <Star className={cn("w-3.5 h-3.5", showFavoritesOnly && "fill-amber-600")} />
                {showFavoritesOnly ? 'Ver Todos' : 'Só Favoritos'}
              </button>

              {items.some(i => i.checked) && (
                <button
                  id="clear-completed"
                  onClick={clearCompleted}
                  className="text-xs font-bold text-[#B42318] bg-[#FEF3F2] hover:bg-[#FEE4E2] px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-[#FECDCA]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar Todos
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-10">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredItems.length > 0 && (
                <motion.div 
                  key="main-list-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.sort((a, b) => b.createdAt - a.createdAt).map((item) => (
                      <ShoppingItemCard 
                        key={item.id} 
                        item={item} 
                        toggleItem={toggleItem} 
                        toggleFavorite={toggleFavorite}
                        deleteItem={deleteItem} 
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* No results for current filter */}
              {items.length > 0 && filteredItems.length === 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[200px] flex flex-col items-center justify-center text-center space-y-4 py-12"
                >
                  <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center border border-[#EAECF0]">
                    <ShoppingCart className="w-10 h-10 text-[#D0D5DD]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#101828]">Nenhum item encontrado</h2>
                    <p className="text-[#667085] mt-1 text-sm">Tente ajustar seus filtros.</p>
                  </div>
                </motion.div>
              )}

              {/* Totally Empty State */}
              {items.length === 0 && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-12"
                >
                  <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center border border-[#EAECF0] shadow-sm">
                    <Sparkles className="w-10 h-10 text-[#D0D5DD]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#101828]">Sua lista está vazia</h2>
                    <p className="text-[#667085] max-w-[240px] mt-1 text-sm">Adicione itens manualmente no topo ou use as sugestões do catálogo.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-8 border-t border-[#EAECF0] flex items-center justify-between text-[#98A2B3]">
            <span className="text-xs font-bold uppercase tracking-widest">
              {items.length} itens no total
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

function ShoppingItemCard({ item, toggleItem, toggleFavorite, deleteItem }: { 
  item: ShoppingItem, 
  toggleItem: (id: string) => void, 
  toggleFavorite: (id: string) => void,
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
        {item.quantity !== '1' && (
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-lg">
               {item.quantity} QTD
             </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(item.id)
          }}
          className={cn(
            "p-2 rounded-xl transition-all",
            item.isFavorite 
              ? "text-amber-500 bg-amber-50 shadow-sm" 
              : "opacity-0 group-hover:opacity-100 text-[#98A2B3] hover:text-amber-500 hover:bg-amber-50"
          )}
        >
          <Star className={cn("w-4 h-4", item.isFavorite && "fill-amber-500")} />
        </button>

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
      </div>
    </motion.div>
  )
}

