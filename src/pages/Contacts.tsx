import { useState, useMemo } from "react"
import { useFinance } from "@/store/FinanceContext"
import { Users, Plus, Pencil, Trash2, Mail, Wallet, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTranslation } from "react-i18next"
import type { Contact } from "@/types"

export function Contacts() {
  const { t } = useTranslation()
  const { contacts, transactions, currency, addContact, updateContact, deleteContact, wallets, addTransaction } = useFinance()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: ""
  })

  // Settle up modal state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [contactToSettle, setContactToSettle] = useState<Contact | null>(null)
  const [settleAmount, setSettleAmount] = useState<number>(0)
  const [settleWalletId, setSettleWalletId] = useState<string>("")

  // Calculate peer debts
  const contactsWithDebts = useMemo(() => {
    return contacts.map(contact => {
      // Find all transactions split with this contact
      const splitTxs = transactions.filter(t => t.splitWith === contact.id)
      
      // Calculate how much this contact owes YOU
      const amountOwedToYou = splitTxs.reduce((sum, t) => sum + (t.splitAmount || 0), 0)

      return {
        ...contact,
        amountOwedToYou,
        splitCount: splitTxs.length
      }
    }).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [contacts, transactions, searchTerm])

  const totalOwedToYou = contactsWithDebts.reduce((sum, c) => sum + c.amountOwedToYou, 0)

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setContactToEdit(contact)
      setFormData({
        name: contact.name,
        email: contact.email || "",
        avatar: contact.avatar || ""
      })
    } else {
      setContactToEdit(null)
      setFormData({ name: "", email: "", avatar: "" })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name) return

    if (contactToEdit) {
      updateContact({
        ...contactToEdit,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      })
    } else {
      addContact({
        id: uuidv4(),
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      })
    }
    setIsModalOpen(false)
  }

  const handleOpenSettleModal = (contact: Contact, amount: number) => {
    setContactToSettle(contact)
    setSettleAmount(amount)
    setSettleWalletId(wallets.length > 0 ? wallets[0].id : "")
    setIsSettleModalOpen(true)
  }

  const handleSettleUp = () => {
    if (!contactToSettle || settleAmount <= 0 || !settleWalletId) return

    addTransaction({
      id: uuidv4(),
      title: `Settled debt from ${contactToSettle.name}`,
      amount: settleAmount,
      type: "income",
      walletId: settleWalletId,
      date: new Date().toISOString(),
      splitWith: contactToSettle.id,
      splitAmount: -settleAmount, // Negative to reduce the debt
    })

    toast.success(`Successfully settled ${formatCurrency(settleAmount, currency)} from ${contactToSettle.name}`)
    setIsSettleModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('contacts.title', 'Split Bills & Contacts')}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t('contacts.subtitle', 'Track shared expenses and see who owes you money.')}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="rounded-full shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> {t('contacts.addFriend', 'Add Friend')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" /> {t('contacts.totalOwed', 'Total Owed to You')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-500">{formatCurrency(totalOwedToYou, currency)}</p>
            <p className="text-xs text-muted-foreground mt-1">From {contactsWithDebts.filter(c => c.amountOwedToYou > 0).length} friends</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="bg-primary/10 p-4 rounded-full">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{t('contacts.proTip', 'Pro Tip: Split Expenses')}</p>
              <p className="text-sm text-muted-foreground">{t('contacts.proTipDesc', 'When adding a new transaction, you can now check "Split Bill" to divide the cost with a friend. It will automatically be tracked here.')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 bg-card border rounded-xl p-2 shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input 
          placeholder={t('contacts.search', 'Search friends...')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 px-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactsWithDebts.map(contact => (
          <Card key={contact.id} className="overflow-hidden hover:shadow-md transition-shadow group">
            <CardContent className="p-0">
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      contact.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{contact.name}</h3>
                    {contact.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" /> {contact.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(contact)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteContact(contact.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 px-5 py-3 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{t('contacts.owesYou', 'Owes You:')}</span>
                  <span className={`font-bold ${contact.amountOwedToYou > 0 ? 'text-indigo-500' : 'text-muted-foreground'}`}>
                    {formatCurrency(contact.amountOwedToYou, currency)}
                  </span>
                </div>
                {contact.amountOwedToYou > 0 && (
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto h-8 text-xs bg-indigo-500 hover:bg-indigo-600"
                    onClick={() => handleOpenSettleModal(contact, contact.amountOwedToYou)}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1.5" /> {t('contacts.settleUp', 'Settle Up')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {contactsWithDebts.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t('contacts.noContacts', 'No contacts found.')}</p>
            <Button variant="link" onClick={() => handleOpenModal()}>{t('contacts.addFirst', 'Add your first friend')}</Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{contactToEdit ? t('contacts.editFriend', 'Edit Friend') : t('contacts.addFriend', 'Add Friend')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('contacts.name', 'Name')}</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>{t('contacts.email', 'Email (Optional)')}</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>{t('contacts.avatar', 'Avatar URL (Optional)')}</Label>
              <Input value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t('contacts.cancel', 'Cancel')}</Button>
            <Button onClick={handleSave} disabled={!formData.name}>{t('contacts.save', 'Save Contact')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettleModalOpen} onOpenChange={setIsSettleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('contacts.settleDebt', 'Settle Debt')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('contacts.recordPaymentDesc', 'Record a payment from')} <strong>{contactToSettle?.name}</strong> {t('contacts.toReduceDebt', 'to reduce their debt.')}
            </p>
            <div className="space-y-2">
              <Label>{t('contacts.amountPaid', 'Amount Paid Back')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {currency}
                </span>
                <Input 
                  type="number" 
                  className="pl-12"
                  value={settleAmount || ""} 
                  onChange={e => setSettleAmount(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('contacts.receiveTo', 'Receive to Wallet')}</Label>
              <Select value={settleWalletId} onValueChange={setSettleWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance, w.currency || currency)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettleModalOpen(false)}>{t('contacts.cancel', 'Cancel')}</Button>
            <Button onClick={handleSettleUp} disabled={settleAmount <= 0 || !settleWalletId}>{t('contacts.recordPayment', 'Record Payment')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
