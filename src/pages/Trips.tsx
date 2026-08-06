import { useState, useMemo } from "react"
import { useFinance } from "@/store/FinanceContext"
import { Plane, Plus, MapPin, Calendar as CalendarIcon, Search, Trash2, Pencil, PowerOff, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTranslation } from "react-i18next"
import type { Trip } from "@/types"

export function Trips() {
  const { t } = useTranslation()
  const { trips, activeTripId, setActiveTripId, addTrip, updateTrip, deleteTrip, transactions, currency, exchangeRates, convertCurrency } = useFinance()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    budget: 1000,
    currency: "USD"
  })

  // Calculate trip expenses
  const tripsWithExpenses = useMemo(() => {
    return (trips || []).map(trip => {
      // Find all transactions for this trip
      const tripTxs = transactions.filter(t => t.tripId === trip.id)
      
      // Calculate total expense in trip's native currency
      const totalExpense = tripTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + convertCurrency(t.amount, currency, trip.currency), 0)

      return {
        ...trip,
        totalExpense,
        txCount: tripTxs.length
      }
    }).filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [trips, transactions, searchTerm, convertCurrency, currency])

  const handleOpenModal = (trip?: Trip) => {
    if (trip) {
      setTripToEdit(trip)
      setFormData({
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        currency: trip.currency
      })
    } else {
      setTripToEdit(null)
      setFormData({
        name: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
        budget: 1000,
        currency: "USD"
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name) return

    if (tripToEdit) {
      updateTrip({
        ...tripToEdit,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        currency: formData.currency
      })
    } else {
      addTrip({
        id: uuidv4(),
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        currency: formData.currency
      })
    }
    setIsModalOpen(false)
  }

  const toggleTravelMode = (tripId: string) => {
    if (activeTripId === tripId) {
      setActiveTripId(null) // Disable
    } else {
      setActiveTripId(tripId) // Enable
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('trips.title', 'Travel Mode & Trips')}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t('trips.subtitle', 'Isolate your holiday expenses from your home budget.')}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="rounded-full shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> {t('trips.planTrip', 'Plan Trip')}
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20 shadow-md mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-cyan-500/20 p-4 rounded-full">
            <Plane className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="font-semibold text-lg">{t('trips.travelModeActive', 'How Travel Mode Works')}</p>
            <p className="text-sm text-muted-foreground">{t('trips.travelModeDesc', 'Activate a trip below. While active, any new transactions you add will automatically be tagged to this trip, helping you track holiday spending separately.')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 bg-card border rounded-xl p-2 shadow-sm mb-4">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input 
          placeholder={t('nav.search', 'Search...')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 px-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripsWithExpenses.map(trip => {
          const isActive = activeTripId === trip.id
          const percentUsed = Math.min((trip.totalExpense / trip.budget) * 100, 100)
          const isOverBudget = trip.totalExpense > trip.budget

          return (
            <Card key={trip.id} className={`overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-cyan-500 shadow-lg scale-[1.02]' : 'hover:shadow-md border'}`}>
              {isActive && (
                <div className="bg-cyan-500 text-white text-xs text-center py-1 font-bold uppercase tracking-wider">
                  {t('trips.travelModeActive', 'Mode Active')}
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{trip.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3" /> {trip.startDate} - {trip.endDate}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(trip)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTrip(trip.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{t('trips.spent', 'Spent')} ({trip.currency})</span>
                      <span className={`font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
                        {formatCurrency(trip.totalExpense, trip.currency)} / {formatCurrency(trip.budget, trip.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isOverBudget ? 'bg-destructive' : 'bg-cyan-500'}`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{trip.txCount} transactions</span>
                    <Button 
                      variant={isActive ? "default" : "outline"} 
                      size="sm" 
                      className={isActive ? "bg-cyan-500 hover:bg-cyan-600 text-white" : ""}
                      onClick={() => toggleTravelMode(trip.id)}
                    >
                      {isActive ? (
                        <><PowerOff className="w-3 h-3 mr-2" /> {t('trips.turnOff', 'Turn Off')}</>
                      ) : (
                        <><Power className="w-3 h-3 mr-2" /> {t('trips.turnOn', 'Turn On')}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {tripsWithExpenses.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-lg">{t('trips.noTrips', 'No trips planned')}</p>
            <p className="text-sm opacity-70 mb-4">{t('trips.planFirst', 'Start planning your next holiday to isolate its expenses.')}</p>
            <Button onClick={() => handleOpenModal()}>{t('trips.planTrip', 'Create First Trip')}</Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{tripToEdit ? t('trips.editTrip', 'Edit Trip') : t('trips.addTrip', 'Plan New Trip')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('trips.tripName', 'Destination / Trip Name')}</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Bali Summer 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('trips.budget', 'Budget')}</Label>
                <Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>{t('trips.currency', 'Currency')}</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  {Object.keys(exchangeRates).slice(0, 15).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                  <option value="SGD">SGD</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t('contacts.cancel', 'Cancel')}</Button>
            <Button onClick={handleSave} disabled={!formData.name}>{t('trips.save', 'Save Trip')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
