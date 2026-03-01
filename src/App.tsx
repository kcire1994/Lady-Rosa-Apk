import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChefHat, 
  ShoppingBasket, 
  Settings, 
  Package, 
  Target, 
  History as HistoryIcon,
  Plus,
  Trash2,
  Calculator,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Condiment {
  id: string;
  name: string;
  packagePrice: number;
  packageWeight: number; // in grams
  amountPerUnit: number; // in grams
}

interface Flavor {
  id: string;
  name: string;
  condiments: Condiment[];
  totalBatchWeight: number; // in grams
  unitWeight: number; // in grams
}

interface Ingredient {
  id: string;
  name: string;
  price: number;
}

interface Packaging {
  boxPrice: number;
  unitsPerBox: number;
}

interface ProductionRecord {
  id: string;
  date: string;
  flavorName: string;
  batches: number;
  totalUnits: number;
  totalBoxes: number;
  totalCost: number;
  totalProfit: number;
  grossRevenue: number;
}

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('production');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence State
  const [flavors, setFlavors] = useState<Flavor[]>(() => {
    const saved = localStorage.getItem('dg_flavors');
    return saved ? JSON.parse(saved) : [];
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('dg_ingredients');
    return saved ? JSON.parse(saved) : [];
  });

  const [packaging, setPackaging] = useState<Packaging>(() => {
    const saved = localStorage.getItem('dg_packaging');
    return saved ? JSON.parse(saved) : { boxPrice: 0, unitsPerBox: 4 };
  });

  const [history, setHistory] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem('dg_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('dg_goal');
    return saved ? JSON.parse(saved) : { targetBoxes: 0, pricePerBox: 0 };
  });

  // Save to localStorage whenever state changes
  useEffect(() => localStorage.setItem('dg_flavors', JSON.stringify(flavors)), [flavors]);
  useEffect(() => localStorage.setItem('dg_ingredients', JSON.stringify(ingredients)), [ingredients]);
  useEffect(() => localStorage.setItem('dg_packaging', JSON.stringify(packaging)), [packaging]);
  useEffect(() => localStorage.setItem('dg_history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('dg_goal', JSON.stringify(dailyGoal)), [dailyGoal]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { id: 'production', label: 'Produção', icon: ChefHat },
    { id: 'ingredients', label: 'Ingredientes', icon: ShoppingBasket },
    { id: 'flavors', label: 'Criar / Editar Sabores', icon: Settings },
    { id: 'packaging', label: 'Embalagem', icon: Package },
    { id: 'goal', label: 'Meta Diária', icon: Target },
    { id: 'history', label: 'Histórico', icon: HistoryIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center shadow-md sticky top-0 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          id="menu-toggle"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-bold tracking-tight">DoceGestor</h1>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-72 bg-primary text-white z-50 shadow-2xl flex flex-col"
      >
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <span className="text-2xl font-bold">Menu</span>
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-6 py-4 text-left transition-colors hover:bg-white/5 ${
                activeTab === item.id ? 'bg-white/10 border-l-4 border-accent' : ''
              }`}
            >
              <item.icon className="mr-4" size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'production' && (
              <ProductionView 
                flavors={flavors} 
                packaging={packaging} 
                onSaveRecord={(rec) => setHistory([rec, ...history])}
              />
            )}
            {activeTab === 'ingredients' && (
              <IngredientsView 
                ingredients={ingredients} 
                setIngredients={setIngredients} 
              />
            )}
            {activeTab === 'flavors' && (
              <FlavorsView 
                flavors={flavors} 
                setFlavors={setFlavors} 
              />
            )}
            {activeTab === 'packaging' && (
              <PackagingView 
                packaging={packaging} 
                setPackaging={setPackaging} 
              />
            )}
            {activeTab === 'goal' && (
              <DailyGoalView 
                dailyGoal={dailyGoal} 
                setDailyGoal={setDailyGoal} 
              />
            )}
            {activeTab === 'history' && (
              <HistoryView 
                history={history} 
                setHistory={setHistory}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Views ---

function ProductionView({ 
  flavors, 
  packaging, 
  onSaveRecord 
}: { 
  flavors: Flavor[], 
  packaging: Packaging,
  onSaveRecord: (rec: ProductionRecord) => void
}) {
  const [condensedMilkPrice, setCondensedMilkPrice] = useState<number>(0);
  const [creamPrice, setCreamPrice] = useState<number>(0);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>('');
  const [batches, setBatches] = useState<number>(1);
  const [pricePerBox, setPricePerBox] = useState<number>(0);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const flavor = flavors.find(f => f.id === selectedFlavorId);
    if (!flavor) return alert('Selecione um sabor');

    const totalMassWeight = flavor.totalBatchWeight * batches;
    const totalUnits = Math.floor(totalMassWeight / flavor.unitWeight);
    const totalBoxes = Math.floor(totalUnits / 4);
    
    // Cost calculation
    // Assuming 1 batch uses 1 can of condensed milk and 1 box of cream (common brigadeiro recipe)
    const baseCostPerBatch = condensedMilkPrice + creamPrice;
    
    // Condiments cost per unit
    let condimentsCostPerUnit = 0;
    flavor.condiments.forEach(c => {
      const costPerGram = c.packagePrice / c.packageWeight;
      condimentsCostPerUnit += costPerGram * c.amountPerUnit;
    });

    const totalCondimentsCost = condimentsCostPerUnit * totalUnits;
    const totalCost = (baseCostPerBatch * batches) + totalCondimentsCost + (packaging.boxPrice * totalBoxes);
    
    const costPerBox = totalBoxes > 0 ? totalCost / totalBoxes : 0;
    const grossRevenue = totalBoxes * pricePerBox;
    const totalProfit = grossRevenue - totalCost;
    const profitPerBox = totalBoxes > 0 ? totalProfit / totalBoxes : 0;

    const res = {
      totalUnits,
      totalBoxes,
      costPerBox,
      profitPerBox,
      totalProfit,
      grossRevenue,
      totalWeightKg: totalMassWeight / 1000
    };

    setResults(res);

    // Auto save to history
    onSaveRecord({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      flavorName: flavor.name,
      batches,
      totalUnits,
      totalBoxes,
      totalCost,
      totalProfit,
      grossRevenue
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold mb-6 text-primary flex items-center">
          <Calculator className="mr-2" /> Nova Produção
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Leite Condensado (R$)</label>
            <input 
              type="number" 
              value={condensedMilkPrice || ''} 
              onChange={e => setCondensedMilkPrice(Number(e.target.value))}
              placeholder="Ex: 5.50"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Creme de Leite (R$)</label>
            <input 
              type="number" 
              value={creamPrice || ''} 
              onChange={e => setCreamPrice(Number(e.target.value))}
              placeholder="Ex: 3.20"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Sabor</label>
            <select 
              value={selectedFlavorId} 
              onChange={e => setSelectedFlavorId(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-accent outline-none transition-all bg-white"
            >
              <option value="">Selecione um sabor</option>
              {flavors.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Quantidade de Massas</label>
            <input 
              type="number" 
              value={batches || ''} 
              onChange={e => setBatches(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-stone-600">Preço de Venda por Caixinha (4 un)</label>
            <input 
              type="number" 
              value={pricePerBox || ''} 
              onChange={e => setPricePerBox(Number(e.target.value))}
              placeholder="Ex: 12.00"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={calculate}
          className="w-full mt-8 bg-accent text-white py-4 rounded-xl font-bold text-lg hover:bg-accent/90 transition-all shadow-lg active:scale-95 flex items-center justify-center"
        >
          <Calculator className="mr-2" /> Calcular
        </button>
      </div>

      {results && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl shadow-md border-2 border-accent/20 space-y-4"
        >
          <h3 className="text-lg font-bold text-primary border-b pb-2">Resultados da Produção</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase font-bold">Total Unidades</p>
              <p className="text-xl font-bold text-stone-800">{results.totalUnits} un</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase font-bold">Total Caixinhas</p>
              <p className="text-xl font-bold text-stone-800">{results.totalBoxes} cx</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase font-bold">Custo por Caixa</p>
              <p className="text-xl font-bold text-red-600">R$ {results.costPerBox.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase font-bold">Lucro por Caixa</p>
              <p className="text-xl font-bold text-green-600">R$ {results.profitPerBox.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase font-bold">Rendimento Bruto</p>
              <p className="text-xl font-bold text-stone-800">R$ {results.grossRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500 uppercase font-bold">Lucro Total</p>
              <p className="text-xl font-bold text-green-600 font-mono">R$ {results.totalProfit.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg col-span-2">
              <p className="text-xs text-stone-500 uppercase font-bold">Peso Total Produção</p>
              <p className="text-xl font-bold text-stone-800">{results.totalWeightKg.toFixed(3)} kg</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function IngredientsView({ ingredients, setIngredients }: { ingredients: Ingredient[], setIngredients: any }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);

  const addIngredient = () => {
    if (!name || price <= 0) return;
    setIngredients([...ingredients, { id: Date.now().toString(), name, price }]);
    setName('');
    setPrice(0);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold mb-6 text-primary">Cadastro de Ingredientes</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Nome do Ingrediente" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
          />
          <input 
            type="number" 
            placeholder="Valor (R$)" 
            value={price || ''}
            onChange={e => setPrice(Number(e.target.value))}
            className="w-full md:w-32 p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
          />
          <button 
            onClick={addIngredient}
            className="bg-accent text-white p-3 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Ingrediente</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Valor</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ingredients.map(ing => (
              <tr key={ing.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-medium">{ing.name}</td>
                <td className="px-6 py-4">R$ {ing.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeIngredient(ing.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {ingredients.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-stone-400 italic">Nenhum ingrediente cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlavorsView({ flavors, setFlavors }: { flavors: Flavor[], setFlavors: any }) {
  const [name, setName] = useState('');
  const [totalBatchWeight, setTotalBatchWeight] = useState<number>(0);
  const [unitWeight, setUnitWeight] = useState<number>(20);
  const [condiments, setCondiments] = useState<Condiment[]>([]);
  
  // New condiment form
  const [cName, setCName] = useState('');
  const [cPrice, setCPrice] = useState<number>(0);
  const [cWeight, setCWeight] = useState<number>(0);
  const [cUsage, setCUsage] = useState<number>(0);

  const addCondiment = () => {
    if (!cName || cPrice <= 0 || cWeight <= 0 || cUsage <= 0) return;
    setCondiments([...condiments, { 
      id: Date.now().toString(), 
      name: cName, 
      packagePrice: cPrice, 
      packageWeight: cWeight, 
      amountPerUnit: cUsage 
    }]);
    setCName(''); setCPrice(0); setCWeight(0); setCUsage(0);
  };

  const saveFlavor = () => {
    if (!name || totalBatchWeight <= 0 || unitWeight <= 0) return alert('Preencha os campos obrigatórios');
    const newFlavor: Flavor = {
      id: Date.now().toString(),
      name,
      totalBatchWeight,
      unitWeight,
      condiments
    };
    setFlavors([...flavors, newFlavor]);
    // Reset form
    setName(''); setTotalBatchWeight(0); setUnitWeight(20); setCondiments([]);
  };

  const removeFlavor = (id: string) => {
    setFlavors(flavors.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold mb-6 text-primary">Novo Sabor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Nome do Sabor</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Brigadeiro Belga"
              className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Peso Total Massa (g)</label>
            <input 
              type="number" 
              value={totalBatchWeight || ''} 
              onChange={e => setTotalBatchWeight(Number(e.target.value))}
              placeholder="Ex: 400"
              className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-stone-600">Peso por Unidade (g)</label>
            <input 
              type="number" 
              value={unitWeight || ''} 
              onChange={e => setUnitWeight(Number(e.target.value))}
              placeholder="Ex: 20"
              className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-md font-bold mb-4 text-stone-700">Condimentos / Granulados</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            <input type="text" placeholder="Nome" value={cName} onChange={e => setCName(e.target.value)} className="p-2 rounded-lg border border-stone-200 col-span-2" />
            <input type="number" placeholder="Preço Pct" value={cPrice || ''} onChange={e => setCPrice(Number(e.target.value))} className="p-2 rounded-lg border border-stone-200" />
            <input type="number" placeholder="Peso Pct(g)" value={cWeight || ''} onChange={e => setCWeight(Number(e.target.value))} className="p-2 rounded-lg border border-stone-200" />
            <input type="number" placeholder="Uso/Un(g)" value={cUsage || ''} onChange={e => setCUsage(Number(e.target.value))} className="p-2 rounded-lg border border-stone-200" />
          </div>
          <button 
            onClick={addCondiment}
            className="w-full bg-stone-100 text-stone-600 py-2 rounded-lg font-bold hover:bg-stone-200 transition-all mb-4"
          >
            + Adicionar Condimento
          </button>

          {condiments.length > 0 && (
            <div className="bg-stone-50 p-4 rounded-xl mb-6">
              <ul className="space-y-2">
                {condiments.map((c, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>{c.name} ({c.amountPerUnit}g/un)</span>
                    <span className="font-bold">R$ {(c.packagePrice / c.packageWeight * c.amountPerUnit).toFixed(2)}/un</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button 
          onClick={saveFlavor}
          className="w-full bg-accent text-white py-4 rounded-xl font-bold hover:bg-accent/90 transition-all shadow-md flex items-center justify-center"
        >
          <Save className="mr-2" /> Salvar Sabor
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary">Sabores Salvos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flavors.map(f => (
            <div key={f.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{f.name}</h3>
                <p className="text-sm text-stone-500">Massa: {f.totalBatchWeight}g | Unidade: {f.unitWeight}g</p>
                <p className="text-xs text-stone-400 mt-1">{f.condiments.length} condimentos cadastrados</p>
              </div>
              <button 
                onClick={() => removeFlavor(f.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {flavors.length === 0 && (
            <div className="col-span-2 py-8 text-center text-stone-400 italic">Nenhum sabor cadastrado ainda</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PackagingView({ packaging, setPackaging }: { packaging: Packaging, setPackaging: any }) {
  const [boxPrice, setBoxPrice] = useState<number>(packaging.boxPrice);
  const [units, setUnits] = useState<number>(packaging.unitsPerBox);

  const save = () => {
    setPackaging({ boxPrice, unitsPerBox: units });
    alert('Configuração de embalagem salva!');
  };

  const unitPrice = units > 0 ? boxPrice / units : 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-primary">Cálculo de Embalagem</h2>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-stone-600">Preço do Pacote de Caixas (R$)</label>
          <input 
            type="number" 
            value={boxPrice || ''} 
            onChange={e => setBoxPrice(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-stone-600">Quantidade de Caixas no Pacote</label>
          <input 
            type="number" 
            value={units || ''} 
            onChange={e => setUnits(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 text-center">
          <p className="text-sm text-stone-500 uppercase font-bold">Valor Unitário da Caixa</p>
          <p className="text-3xl font-bold text-accent">R$ {unitPrice.toFixed(2)}</p>
        </div>

        <button 
          onClick={save}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md"
        >
          Salvar Configuração
        </button>
      </div>
    </div>
  );
}

function DailyGoalView({ dailyGoal, setDailyGoal }: { dailyGoal: any, setDailyGoal: any }) {
  const [target, setTarget] = useState<number>(dailyGoal.targetBoxes);
  const [price, setPrice] = useState<number>(dailyGoal.pricePerBox);

  const save = () => {
    setDailyGoal({ targetBoxes: target, pricePerBox: price });
    alert('Meta salva!');
  };

  const totalRevenue = target * price;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-primary">Meta Diária</h2>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-stone-600">Meta de Caixinhas Vendidas</label>
          <input 
            type="number" 
            value={target || ''} 
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-stone-600">Preço por Caixinha (R$)</label>
          <input 
            type="number" 
            value={price || ''} 
            onChange={e => setPrice(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div className="p-6 bg-green-50 rounded-xl border border-green-100 text-center">
          <p className="text-sm text-stone-500 uppercase font-bold">Previsão de Faturamento</p>
          <p className="text-4xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
        </div>

        <button 
          onClick={save}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md"
        >
          Salvar Meta
        </button>
      </div>
    </div>
  );
}

function HistoryView({ history, setHistory }: { history: ProductionRecord[], setHistory: any }) {
  const clearHistory = () => {
    if (confirm('Deseja limpar todo o histórico?')) {
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Histórico de Produção</h2>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-red-500 text-sm font-bold hover:underline"
          >
            Limpar Tudo
          </button>
        )}
      </div>

      <div className="space-y-4">
        {history.map(rec => (
          <div key={rec.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{rec.flavorName}</h3>
                <p className="text-xs text-stone-400">{rec.date}</p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-bold">Lucro: R$ {rec.totalProfit.toFixed(2)}</p>
                <p className="text-xs text-stone-500">Bruto: R$ {rec.grossRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-50 text-center">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Massas</p>
                <p className="font-bold">{rec.batches}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Unidades</p>
                <p className="font-bold">{rec.totalUnits}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Caixas</p>
                <p className="font-bold">{rec.totalBoxes}</p>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="py-12 text-center text-stone-400 italic bg-white rounded-2xl border border-dashed border-stone-200">
            Nenhuma produção registrada ainda
          </div>
        )}
      </div>
    </div>
  );
}
