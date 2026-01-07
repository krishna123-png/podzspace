import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { paymentsAPI, usersAPI } from '@/lib/api'
import { CreditCard, Building2, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BankAccountSetupPage = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  })
  const [hasExisting, setHasExisting] = useState(false)

  useEffect(() => {
    checkExistingAccount()
  }, [])

  const checkExistingAccount = async () => {
    // Check if user already has bank account setup
    if (user?.accountNumber) {
      setHasExisting(true)
      setFormData({
        accountHolderName: user.accountHolderName || '',
        accountNumber: '****' + user.accountNumber?.slice(-4) || '',
        confirmAccountNumber: '',
        ifscCode: user.ifscCode || '',
        bankName: user.bankName || '',
        upiId: user.upiId || '',
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasExisting && formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error('Account numbers do not match')
      return
    }

    setLoading(true)
    try {
      await paymentsAPI.setupBankAccount({
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        bankName: formData.bankName,
        upiId: formData.upiId,
      })

      toast.success('Bank account details saved successfully!')
      setHasExisting(true)
      
      // Refresh user data
      const updatedUser = await usersAPI.getProfile(user?.id!)
      useAuthStore.getState().setUser(updatedUser.data.user)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save bank details')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'STUDIO_OWNER') {
    return (
      <div className="section-container">
        <div className="card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Studio Owner Only</h2>
          <p className="text-gray-600">
            Bank account setup is only available for studio owners.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-container">
      <div className="max-w-3xl mx-auto">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold">Bank Account Setup</h1>
              <p className="text-gray-600">
                Set up your bank account to receive payments directly
              </p>
            </div>
          </div>

          {hasExisting && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Account Connected</h3>
                <p className="text-sm text-green-700">
                  Your bank account is connected. Payments will be automatically transferred to your account.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                className="input"
                required
                placeholder="Full name as per bank account"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="input"
                required
                disabled={hasExisting}
                placeholder="Enter your bank account number"
                maxLength={18}
              />
            </div>

            {/* Confirm Account Number */}
            {!hasExisting && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Account Number *
                </label>
                <input
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleChange}
                  className="input"
                  required
                  placeholder="Re-enter your account number"
                  maxLength={18}
                />
              </div>
            )}

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className="input uppercase"
                required
                placeholder="e.g., SBIN0001234"
                maxLength={11}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find IFSC code on your bank passbook or cheque
              </p>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="input"
                required
                placeholder="e.g., State Bank of India"
              />
            </div>

            {/* UPI ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="input"
                placeholder="your@upi"
              />
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🔒 Secure & Encrypted</h4>
              <p className="text-sm text-blue-700">
                Your banking information is encrypted and securely stored. We use industry-standard security protocols to protect your data.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Saving...' : hasExisting ? 'Update Bank Details' : 'Save Bank Details'}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600">1.</span>
                <span>When a customer books your studio, they pay through Razorpay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600">2.</span>
                <span>Platform commission (15%) is deducted automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600">3.</span>
                <span>Your share (85%) is instantly transferred to your bank account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600">4.</span>
                <span>Settlements usually take 1-2 business days to reflect in your account</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankAccountSetupPage
