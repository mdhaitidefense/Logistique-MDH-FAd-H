import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertCircle, X, Users, Edit2, Trash2, MapPin, Package, User as UserIcon,
  Camera, Scan, Plus, Search, ArrowRightLeft, TrendingUp, Filter, Download, MoreVertical, 
  LayoutDashboard, ClipboardList, PieChart, Brain, ChevronRight, Settings
} from 'lucide-react';
import { BarcodeScanner } from './components/BarcodeScanner';
import { supabase } from './supabase';
import { GoogleGenAI } from '@google/genai';

// Types
import { 
  InventoryItem, Movement, MilitaryUnit, PreAuthorizedUser, UserProfile, AIAnalysisResult, Category, TransportMethod 
} from './types';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Movements } from './pages/Movements';
import { Units } from './pages/Units';
import { Reports } from './pages/Reports';
import { AIAnalysis } from './pages/AIAnalysis';
import { UserManagement } from './pages/UserManagement';

// UI
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { cn } from './lib/utils';
import { AVAILABLE_ICONS } from './components/ui/IconRenderer';

const SUGGESTED_CATEGORIES = [
  "Armement & Munitions", "Véhicules & Transport", "Équipement Tactique", 
  "Communications & Électronique", "Médical & Santé", "Subsistance (Nourriture/Eau)", 
  "Carburant & Lubrifiants", "Matériaux de Construction", "Fournitures de Bureau", 
  "Habillement & Protection", "Mobilier", "Informatique", "Outillage", "Autre"
];

function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data state
  const [preAuthorizedUsers, setPreAuthorizedUsers] = useState<PreAuthorizedUser[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [units, setUnits] = useState<MilitaryUnit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transportMethods, setTransportMethods] = useState<TransportMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'movements' | 'reports' | 'units' | 'ai_analysis' | 'user_management'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  
  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Modals state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isViewingUnit, setIsViewingUnit] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingTransport, setIsAddingTransport] = useState(false);
  const [newTransportName, setNewTransportName] = useState('');
  
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [barcodeScanTarget, setBarcodeScanTarget] = useState<'new' | 'edit' | null>(null);

  // Form State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    organization: 'Ministère de la Défense',
    quantity: 1,
    condition: 'Bon',
    munitions: { type: '', quantity: 0 }
  });
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newMovement, setNewMovement] = useState<Partial<Movement>>({
    status: 'En transit',
    departureDate: new Date().toISOString().split('T')[0],
    quantity: 1
  });
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [isEditingMovement, setIsEditingMovement] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<MilitaryUnit>>({
    branch: 'Armée de Terre'
  });
  const [editingUnit, setEditingUnit] = useState<MilitaryUnit | null>(null);
  const [viewingUnit, setViewingUnit] = useState<MilitaryUnit | null>(null);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

      if (!userEmail) { setLoading(false); return; }

      // 1. Get current profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) console.warn('[Auth] users query error:', profileError.message);

      // 2. Get pre-authorized role — only 'role' and 'organization' exist in this table
      const { data: preAuth, error: preAuthError } = await supabase
        .from('pre_authorized_users')
        .select('role, organization')
        .ilike('email', userEmail.trim())
        .maybeSingle();

      if (preAuthError) console.warn('[Auth] pre_authorized_users query error:', preAuthError.message);
      console.log('[Auth] email:', userEmail, '| profile.role:', profile?.role, '| preAuth.role:', preAuth?.role);

      let finalProfile = profile;

      // 3. Sync role from pre_authorized_users → users table if needed
      if (preAuth && (!profile || profile.role?.trim() !== preAuth.role?.trim())) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: userEmail,
            role: preAuth.role,
            full_name: profile?.full_name || userEmail.split('@')[0],
            organization: profile?.organization || preAuth.organization || 'Ministère de la Défense',
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (!updateError && updatedProfile) {
          finalProfile = updatedProfile;
        } else if (updateError) {
          // Upsert failed (RLS or other) — build profile in memory from pre_auth data
          console.warn('[Auth] Upsert failed:', updateError.message, '— using preAuth role in memory');
          finalProfile = {
            ...(profile || {}),
            id: userId,
            email: userEmail,
            role: preAuth.role,
            full_name: profile?.full_name || userEmail.split('@')[0],
            organization: profile?.organization || preAuth.organization || 'Ministère de la Défense',
          };
        }
      }

      if (finalProfile) {
        console.log('[Auth] Final role set:', finalProfile.role);
        setUserProfile(finalProfile);
        if (finalProfile.role !== 'Administrateur' && activeTab === 'user_management') {
          setActiveTab('dashboard');
        }
      } else if (preAuth) {
        // Fallback: no users row found, but we know the pre-authorized role
        const fallbackProfile = {
          id: userId,
          email: userEmail,
          role: preAuth.role,
          full_name: userEmail.split('@')[0],
          organization: preAuth.organization || 'Ministère de la Défense',
        };
        console.log('[Auth] Fallback role from preAuth:', fallbackProfile.role);
        setUserProfile(fallbackProfile as any);
      } else {
        // No profile and not pre-authorized → treat as regular user
        const defaultProfile = {
          id: userId,
          email: userEmail,
          role: 'Consultant',
          full_name: userEmail.split('@')[0],
          organization: 'Ministère de la Défense',
        };
        console.warn('[Auth] No preAuth entry for:', userEmail, '→ defaulting to Consultant');
        setUserProfile(defaultProfile as any);
      }
      
      fetchData();
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, movementsData, unitsData, preAuthData, catData, transData] = await Promise.all([
        supabase.from('items').select('*').order('created_at', { ascending: false }),
        supabase.from('movements').select('*').order('departureDate', { ascending: false }),
        supabase.from('units').select('*').order('name', { ascending: true }),
        supabase.from('pre_authorized_users').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('transport_methods').select('*').order('name', { ascending: true })
      ]);

      if (itemsData.data) setItems(itemsData.data);
      if (movementsData.data) setMovements(movementsData.data);
      if (unitsData.data) setUnits(unitsData.data);
      if (preAuthData.data) setPreAuthorizedUsers(preAuthData.data);
      if (catData.data) setCategories(catData.data);
      if (transData.data) setTransportMethods(transData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent, email: string, password: string) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message === 'Invalid login credentials' 
          ? 'Identifiants incorrects' 
          : error.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Une erreur est survenue');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const runAIAnalysis = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert("La clé d'API AI n'est pas configurée.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const inventorySummary = items.map(i => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        minThreshold: i.minThreshold,
        condition: i.condition,
        org: i.organization,
        militaryUnit: units.find(u => u.id === i.militaryUnitId)?.name || 'N/A'
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyse cet inventaire logistique militaire (MDH & FAd'H) et fournis des insights stratégiques en JSON.
        Inventaire: ${JSON.stringify(inventorySummary)}
        
        Réponds UNIQUEMENT avec un objet JSON valide suivant exactement cette structure:
        {
          "globalSummary": "Résumé textuel analytique global",
          "insights": [
            {
              "category": "Catégorie de matériel (ex: Armement)",
              "status": "Critique" | "Attention" | "Optimal",
              "observation": "Observation précise des données",
              "recommendation": "Action recommandée",
              "prediction": "Prédiction si aucune action n'est prise"
            }
          ]
        }`
      });
      
      const jsonText = response.text?.replace(/```json|```/g, '').trim();
      const result = JSON.parse(jsonText || '{}');
      setAiAnalysis({
        ...result,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("L'analyse IA a échoué. Veuillez vérifier votre connexion ou réessayer plus tard.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // CRUD Handlers
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('items').insert({
        ...newItem,
        quantity: newItem.quantity || 1,
        minThreshold: newItem.minThreshold || 0,
        estimatedValue: newItem.estimatedValue || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      setIsAddingItem(false);
      setNewItem({
        organization: 'Ministère de la Défense',
        quantity: 1,
        condition: 'Bon',
        munitions: { type: '', quantity: 0 }
      });
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
      alert("Erreur lors de l'ajout de l'article.");
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.id) return;
    try {
      const { id, ...itemData } = editingItem;
      const { error } = await supabase.from('items').update({
        ...itemData,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      setIsEditingItem(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
      alert("Erreur lors de la mise à jour de l'article.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    try {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      setIsEditingItem(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert("Erreur lors de la suppression de l'article.");
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovement.itemId) return;
    try {
      const { error } = await supabase.from('movements').insert({
        ...newMovement
      });
      if (error) throw error;
      setIsAddingMovement(false);
      setNewMovement({ status: 'En transit', departureDate: new Date().toISOString().split('T')[0], quantity: 1 });
      fetchData();
    } catch (error: any) {
      console.error('Error adding movement:', error);
      alert("Erreur exacte de Supabase : " + (error?.message || JSON.stringify(error)));
    }
  };

  const handleUpdateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement || !editingMovement.id) return;
    try {
      const { id, ...movementData } = editingMovement;
      const { error } = await supabase.from('movements').update({
        ...movementData
      }).eq('id', id);
      if (error) throw error;
      setIsEditingMovement(false);
      setEditingMovement(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating movement:', error);
      alert("Erreur lors de la modification du mouvement: " + (error?.message || JSON.stringify(error)));
    }
  };

  const handleDeleteMovement = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce mouvement ?")) return;
    try {
      const { error } = await supabase.from('movements').delete().eq('id', id);
      if (error) throw error;
      setIsEditingMovement(false);
      setEditingMovement(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting movement:', error);
      alert("Erreur lors de la suppression du mouvement.");
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('units').insert({
        ...newUnit
      });
      if (error) throw error;
      setIsAddingUnit(false);
      setNewUnit({ branch: 'Armée de Terre' });
      fetchData();
    } catch (error) {
      console.error('Error adding unit:', error);
      alert("Erreur lors de l'ajout de l'unité.");
    }
  };

  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editingUnit.id) return;
    try {
      const { id, ...unitData } = editingUnit;
      const { error } = await supabase.from('units').update({
        ...unitData
      }).eq('id', id);
      if (error) throw error;
      setIsEditingUnit(false);
      setEditingUnit(null);
      fetchData();
    } catch (error) {
      console.error('Error updating unit:', error);
      alert("Erreur lors de la mise à jour de l'unité.");
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette unité ?")) return;
    try {
      const { error } = await supabase.from('units').delete().eq('id', id);
      if (error) throw error;
      setIsEditingUnit(false);
      setEditingUnit(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert("Erreur lors de la suppression de l'unité.");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase.from('categories').insert({ name: newCategoryName.trim() });
      if (error) throw error;
      setIsAddingCategory(false);
      setNewCategoryName('');
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      alert("Erreur lors de l'ajout de la catégorie.");
    }
  };

  const handleAddTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransportName.trim()) return;
    try {
      const { error } = await supabase.from('transport_methods').insert({ name: newTransportName.trim() });
      if (error) throw error;
      setIsAddingTransport(false);
      setNewTransportName('');
      fetchData();
    } catch (error) {
      console.error('Error adding transport:', error);
      alert("Erreur lors de l'ajout de la méthode de transport.");
    }
  };

  // Admin only when the user profile explicitly has the Administrateur role
  const isAdmin = userProfile?.role === 'Administrateur';

  const handleBarcodeResult = (decodedText: string) => {
    if (barcodeScanTarget === 'new') {
      setNewItem({ ...newItem, serialNumber: decodedText });
    } else if (barcodeScanTarget === 'edit' && editingItem) {
      setEditingItem({ ...editingItem, serialNumber: decodedText });
    }
    setIsScanningBarcode(false);
    setBarcodeScanTarget(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login handleLogin={handleLogin} authError={authError} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isAdmin={isAdmin} 
          handleLogout={handleLogout} 
        />
        
        <main className="flex-1 flex flex-col min-w-0">
          <Header 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen} 
            activeTab={activeTab} 
            userProfile={userProfile} 
            isAdmin={isAdmin}
            setIsAddingCategory={setIsAddingCategory}
            setIsAddingTransport={setIsAddingTransport}
          />

          <div className="p-4 md:p-8 overflow-y-auto">
            {activeTab === 'dashboard' && <Dashboard items={items} />}
            {activeTab === 'inventory' && (
              <Inventory 
                items={items} 
                isAdmin={isAdmin} 
                setIsAddingItem={setIsAddingItem} 
                setEditingItem={setEditingItem} 
                setIsEditingItem={setIsEditingItem} 
              />
            )}
            {activeTab === 'movements' && (
              <Movements 
                movements={movements} 
                isAdmin={isAdmin} 
                setIsAddingMovement={setIsAddingMovement} 
                setIsEditingMovement={setIsEditingMovement}
                setEditingMovement={setEditingMovement}
                handleDeleteMovement={handleDeleteMovement}
              />
            )}
            {activeTab === 'units' && (
              <Units 
                units={units} 
                isAdmin={isAdmin} 
                setIsAddingUnit={setIsAddingUnit} 
                setEditingUnit={setEditingUnit} 
                setIsEditingUnit={setIsEditingUnit} 
                setViewingUnit={setViewingUnit} 
                setIsViewingUnit={setIsViewingUnit} 
                handleDeleteUnit={handleDeleteUnit} 
              />
            )}
            {activeTab === 'reports' && <Reports items={items} units={units} />}
            {activeTab === 'ai_analysis' && (
              <AIAnalysis 
                aiAnalysis={aiAnalysis} 
                isAnalyzing={isAnalyzing} 
                runAIAnalysis={runAIAnalysis} 
              />
            )}
            {activeTab === 'user_management' && isAdmin && (
              <UserManagement 
                preAuthorizedUsers={preAuthorizedUsers} 
                fetchData={fetchData} 
              />
            )}
          </div>
        </main>

        {/* MODALS */}
        {/* ADD ITEM MODAL */}
        {isAddingItem && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Nouvel Article d'Inventaire</h3>
                <button onClick={() => setIsAddingItem(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nom de l'article</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.name || ''}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Numéro de Série / Code Barre</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                        value={newItem.serialNumber || ''}
                        onChange={e => setNewItem({...newItem, serialNumber: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setBarcodeScanTarget('new');
                          setIsScanningBarcode(true);
                        }}
                        className="p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Scanner le code barre"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Organisation</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.organization}
                      onChange={e => setNewItem({...newItem, organization: e.target.value as any, militaryUnitId: ''})}
                    >
                      <option value="Ministère de la Défense">Ministère de la Défense</option>
                      <option value="Forces Armées d'Haïti">Forces Armées d'Haïti</option>
                      <option value="Conjoint (Ministère & FAd'H)">Conjoint (Ministère & FAd'H)</option>
                    </select>
                  </div>
                  {newItem.organization === "Forces Armées d'Haïti" && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Unité Militaire</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                        value={newItem.militaryUnitId || ''}
                        onChange={e => setNewItem({...newItem, militaryUnitId: e.target.value})}
                      >
                        <option value="">Sélectionner une unité...</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Catégorie</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        list="category-suggestions"
                        placeholder="ex: Armement, Véhicule..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                        value={newItem.category || ''}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                      />
                      <datalist id="category-suggestions">
                        {categories.length > 0 ? categories.map(cat => (
                          <option key={cat.id} value={cat.name} />
                        )) : SUGGESTED_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Quantité</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.quantity || 1}
                      onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Seuil Alerte</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.minThreshold || 0}
                      onChange={e => setNewItem({...newItem, minThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Valeur Estimée ($)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.estimatedValue || 0}
                      onChange={e => setNewItem({...newItem, estimatedValue: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">État</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.condition}
                      onChange={e => setNewItem({...newItem, condition: e.target.value})}
                    >
                      <option value="Neuf">Neuf</option>
                      <option value="Bon">Bon</option>
                      <option value="Usagé">Usagé</option>
                      <option value="Endommagé">Endommagé</option>
                      <option value="En réparation">En réparation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Emplacement</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newItem.location || ''}
                      onChange={e => setNewItem({...newItem, location: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">Icône</label>
                    <div className="grid grid-cols-8 sm:grid-cols-11 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 overflow-y-auto max-h-32">
                      {AVAILABLE_ICONS.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setNewItem({ ...newItem, icon: icon.name })}
                          className={cn(
                            "p-2 rounded-lg flex items-center justify-center transition-all",
                            newItem.icon === icon.name ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-200 text-slate-500"
                          )}
                          title={icon.name}
                        >
                          <icon.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                    Enregistrer l'Article
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT ITEM MODAL */}
        {isEditingItem && editingItem && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Modifier l'Article</h3>
                <button onClick={() => setIsEditingItem(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateItem} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nom de l'article</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.name || ''}
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Numéro de Série / Code Barre</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                        value={editingItem.serialNumber || ''}
                        onChange={e => setEditingItem({...editingItem, serialNumber: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setBarcodeScanTarget('edit');
                          setIsScanningBarcode(true);
                        }}
                        className="p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Scanner le code barre"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Organisation</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.organization}
                      onChange={e => setEditingItem({...editingItem, organization: e.target.value as any})}
                    >
                      <option value="Ministère de la Défense">Ministère de la Défense</option>
                      <option value="Forces Armées d'Haïti">Forces Armées d'Haïti</option>
                      <option value="Conjoint (Ministère & FAd'H)">Conjoint</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Catégorie</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.category || ''}
                      onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Quantité</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.quantity || 1}
                      onChange={e => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Seuil Alerte</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.minThreshold || 0}
                      onChange={e => setEditingItem({...editingItem, minThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">État</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.condition}
                      onChange={e => setEditingItem({...editingItem, condition: e.target.value})}
                    >
                      <option value="Neuf">Neuf</option>
                      <option value="Bon">Bon</option>
                      <option value="Usagé">Usagé</option>
                      <option value="Endommagé">Endommagé</option>
                      <option value="En réparation">En réparation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Emplacement</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingItem.location || ''}
                      onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">Icône</label>
                    <div className="grid grid-cols-8 sm:grid-cols-11 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 overflow-y-auto max-h-32">
                      {AVAILABLE_ICONS.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, icon: icon.name })}
                          className={cn(
                            "p-2 rounded-lg flex items-center justify-center transition-all",
                            editingItem.icon === icon.name ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-200 text-slate-500"
                          )}
                        >
                          <icon.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => editingItem.id && handleDeleteItem(editingItem.id)}
                    className="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Supprimer
                  </button>
                  <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD UNIT MODAL */}
        {isAddingUnit && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Nouvelle Unité Militaire</h3>
                <button onClick={() => setIsAddingUnit(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddUnit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nom de l'unité</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newUnit.name || ''}
                      onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Branche</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newUnit.branch}
                      onChange={e => setNewUnit({...newUnit, branch: e.target.value as any})}
                    >
                      <option value="Armée de Terre">Armée de Terre</option>
                      <option value="Corps d'Aviation">Corps d'Aviation</option>
                      <option value="Garde-Côtes">Garde-Côtes</option>
                      <option value="Génie Militaire">Génie Militaire</option>
                      <option value="Service de Santé">Service de Santé</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Localisation</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newUnit.location || ''}
                      onChange={e => setNewUnit({...newUnit, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Commandant</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newUnit.commander || ''}
                      onChange={e => setNewUnit({...newUnit, commander: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                    Créer l'Unité
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT UNIT MODAL */}
        {isEditingUnit && editingUnit && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Modifier l'Unité</h3>
                <button onClick={() => setIsEditingUnit(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateUnit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nom de l'unité</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingUnit.name || ''}
                      onChange={e => setEditingUnit({...editingUnit, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Branche</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingUnit.branch}
                      onChange={e => setEditingUnit({...editingUnit, branch: e.target.value as any})}
                    >
                      <option value="Armée de Terre">Armée de Terre</option>
                      <option value="Corps d'Aviation">Corps d'Aviation</option>
                      <option value="Garde-Côtes">Garde-Côtes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Localisation</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingUnit.location || ''}
                      onChange={e => setEditingUnit({...editingUnit, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Commandant</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingUnit.commander || ''}
                      onChange={e => setEditingUnit({...editingUnit, commander: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-bold">Mettre à jour l'Unité</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD MOVEMENT MODAL */}
        {isAddingMovement && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Enregistrer un Mouvement</h3>
                <button onClick={() => setIsAddingMovement(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddMovement} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-bold text-slate-700">Article à déplacer</label>
                    <select 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newMovement.itemId || ''}
                      onChange={e => {
                        const item = items.find(i => i.id === e.target.value);
                        setNewMovement({
                          ...newMovement, 
                          itemId: e.target.value,
                          itemName: item?.name,
                          itemType: item?.category as any
                        });
                      }}
                    >
                      <option value="">Sélectionner un article...</option>
                      {items.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.quantity} en stock)</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Quantité</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newMovement.quantity || 1}
                      onChange={e => setNewMovement({...newMovement, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Statut</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newMovement.status}
                      onChange={e => setNewMovement({...newMovement, status: e.target.value as any})}
                    >
                      <option value="En transit">En transit</option>
                      <option value="Livré">Livré</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Méthode de Transport</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newMovement.transportMethod || ''}
                      onChange={e => setNewMovement({...newMovement, transportMethod: e.target.value})}
                    >
                      <option value="">Sélectionner ou par défaut...</option>
                      {transportMethods.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Unité d'Origine</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newMovement.originUnit || ''}
                      onChange={e => setNewMovement({...newMovement, originUnit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Unité de Destination</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={newMovement.destinationUnit || ''}
                      onChange={e => setNewMovement({...newMovement, destinationUnit: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg">
                    Confirmer le Mouvement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MOVEMENT MODAL */}
        {isEditingMovement && editingMovement && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Modifier un Mouvement</h3>
                <button onClick={() => setIsEditingMovement(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateMovement} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-bold text-slate-700">Article déplacé</label>
                    <input 
                      disabled
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      value={`${editingMovement.itemName} (ID: ${editingMovement.itemId})`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Quantité</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingMovement.quantity || 1}
                      onChange={e => setEditingMovement({...editingMovement, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Statut</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingMovement.status}
                      onChange={e => setEditingMovement({...editingMovement, status: e.target.value as any})}
                    >
                      <option value="En transit">En transit</option>
                      <option value="Livré">Livré</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Méthode de Transport</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingMovement.transportMethod || ''}
                      onChange={e => setEditingMovement({...editingMovement, transportMethod: e.target.value})}
                    >
                      <option value="">Sélectionner ou par défaut...</option>
                      {transportMethods.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Unité d'Origine</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingMovement.originUnit || ''}
                      onChange={e => setEditingMovement({...editingMovement, originUnit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Unité de Destination</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                      value={editingMovement.destinationUnit || ''}
                      onChange={e => setEditingMovement({...editingMovement, destinationUnit: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => editingMovement.id && handleDeleteMovement(editingMovement.id)}
                    className="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    Supprimer
                  </button>
                  <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

        {/* ADD CATEGORY MODAL */}
        {isAddingCategory && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Nouvelle Catégorie</h3>
                <button onClick={() => setIsAddingCategory(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nom de la Catégorie</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg">
                    Créer la Catégorie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD TRANSPORT MODAL */}
        {isAddingTransport && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Nouvelle Méthode de Transport</h3>
                <button onClick={() => setIsAddingTransport(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddTransport} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nom de la Méthode</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                    value={newTransportName}
                    onChange={e => setNewTransportName(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg">
                    Créer la Méthode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BARCODE SCANNER MODAL */}
        {isScanningBarcode && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-900">
                  <Scan className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Scanner Code-Barre</h3>
                </div>
                <button 
                  onClick={() => {
                    setIsScanningBarcode(false);
                    setBarcodeScanTarget(null);
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-sm text-slate-500 text-center">
                  Placez le code-barre ou le QR code dans le cadre ci-dessous pour le scanner automatiquement.
                </p>
                <BarcodeScanner 
                  onResult={handleBarcodeResult} 
                  onError={(err) => console.log("Scanner Error:", err)} 
                />
                <button 
                  onClick={() => {
                    setIsScanningBarcode(false);
                    setBarcodeScanTarget(null);
                  }}
                  className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Annuler le scan
                </button>
              </div>
            </div>
          </div>
        )}

    </ErrorBoundary>
  );
}

export default App;
