import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { getEmailError, getPhoneError, getPasswordError, getConfirmPasswordError, getDepartmentError, isValidEmail, isValidPhone } from '@shared/util/validation'
import useEscapeKey from '@/hooks/useEscapeKey'
import useSend from '@/hooks/useSend'
import useToast from '@/hooks/useToast'
import Logo from '@/components/Logo'
import Select from '@/components/Select'
import WelcomeToast from '@/components/toast/WelcomeToast'
import { departments } from '@shared/data/departments'
import { authService } from '@/api'

const submitClass = 'bg-primary text-surface h-[44px] rounded-[8px] text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2'
const inputClass = 'w-full border h-[42px] px-3 rounded-[8px] text-[14px] outline-none'
const inputClassSmall = 'w-full border h-[40px] px-3 rounded-[8px] text-[14px] outline-none'
const passwordClass = 'w-full border h-[42px] pl-3 pr-10 rounded-[8px] text-[14px] outline-none'
const passwordClassSmall = 'w-full border h-[40px] pl-3 pr-10 rounded-[8px] text-[14px] outline-none'

const ErrorText = ({ message }) => (
	<div className="h-[16px] flex items-center mt-1">
		{message && <span className="text-[12px] text-red-500">{message}</span>}
	</div>
)

const Field = ({ label, action, children }) => (
	<div>
		{action ? (
			<div className="flex justify-between items-center mb-1">
				<label className="text-[13px] font-medium text-text">{label} <span className="text-red-500">*</span></label>
				{action}
			</div>
		) : (
			<label className="text-[13px] font-medium text-text mb-1 block">{label} <span className="text-red-500">*</span></label>
		)}
		{children}
	</div>
)

const TextInput = ({ label, value, onChange, error, className, ...rest }) => (
	<Field label={label}>
		<input className={`${className} ${error ? 'border-red-500' : 'border-gray-300'}`} value={value} onChange={onChange} {...rest} />
		<ErrorText message={error} />
	</Field>
)

const PasswordInput = ({ label, value, onChange, error, className, action, showPass, onToggleShow, ...rest }) => (
	<Field label={label} action={action}>
		<div className="relative">
			<input type={showPass ? 'text' : 'password'} className={`${className} ${error ? 'border-red-500' : 'border-gray-300'}`} value={value} onChange={onChange} {...rest} />
			<button type="button" onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-text/60 hover:text-text">
				{showPass ? <EyeOff size={18} /> : <Eye size={18} />}
			</button>
		</div>
		<ErrorText message={error} />
	</Field>
)

export default ({ isOpen, onClose, mode = 'login', initialError = '', initialData = {} }) => {
	const [tab, setTab] = useState(mode)
	const [showPass, setShowPass] = useState(false)
	const [error, setError] = useState(initialError)
	const [msg, setMsg] = useState('')
	const [form, setForm] = useState({ phone: '', department: '', password: '', confirmPassword: '', ...initialData })
	const toast = useToast()

	const set = (key, value) => {
		setError('')
		setMsg('')
		setForm(form => ({ ...form, [key]: value }))
	}

	const saveAuth = ({ data }) => {
		localStorage.setItem('auth_token', data.token)
		sessionStorage.setItem('just_logged_in', '1')
		onClose()
		window.location.href = '/borrow'
	}

	const showCheckInbox = () => {
		setTab('login')
		setForm({ phone: '', department: '', password: '', confirmPassword: '' })
		toast.show('Account created! Check your inbox to verify.')
	}

	const loginSend = useSend({ send: authService.login, onSuccess: saveAuth, onError: (err) => err.status === 403 ? toast.show(err.message) : setError(err.message || 'Email or password is invalid') })
	const registerSend = useSend({ send: authService.register, onSuccess: showCheckInbox, onError: (err) => setError(err.errors?.email?.[0] || err.errors?.phone?.[0] || err.message || 'Registration failed') })
	const forgotSend = useSend({ send: authService.forgotPassword, onSuccess: () => setMsg('Reset link sent! Check your inbox.'), onError: (err) => setError(err.message || 'Failed to send reset link') })
	const resetSend = useSend({ send: authService.resetPassword, onSuccess: () => { setTab('login'); setForm(form => ({ ...form, password: '', confirmPassword: '' })) }, onError: (err) => setError(err.message || 'Invalid or expired reset link') })

	useEscapeKey(onClose)

	useEffect(() => {
		if (!isOpen) return
		setTab(mode)
		setShowPass(false)
		setError('')
		setMsg('')
		setForm({ phone: '', department: '', password: '', confirmPassword: '', ...initialData })
	}, [isOpen, mode, initialData, setForm])

	useEffect(() => {
		if (initialError) setError(initialError)
	}, [initialError])

	if (!isOpen) return null

	const validLogin = isValidEmail(form.email) && form.password.length >= 8
	const validRegister = (form.firstname || '').trim() && (form.lastname || '').trim() && isValidEmail(form.email) && isValidPhone(form.phone) && (form.department || '').trim() && (form.password || '').length >= 8
	const validForgot = isValidEmail(form.email)
	const validReset = (form.password || '').length >= 8 && form.password === form.confirmPassword && form.token

	const emailErr = error || getEmailError(form.email)
	const passErr = getPasswordError(form.password)
	const departmentErr = form.department ? getDepartmentError(form.department) : ''

	const handleLogin = (e) => {
		e.preventDefault()
		if (validLogin && !loginSend.isPending) loginSend.send({ email: form.email, password: form.password })
	}

	const handleRegister = (e) => {
		e.preventDefault()
		if (validRegister && !registerSend.isPending) registerSend.send(form)
	}

	const handleForgot = (e) => {
		e.preventDefault()
		if (validForgot && !forgotSend.isPending) forgotSend.send({ email: form.email })
	}

	const handleReset = (e) => {
		e.preventDefault()
		if (validReset && !resetSend.isPending) resetSend.send({ token: form.token, email: form.email, password: form.password })
	}

	return (
		<>
		<div className="fixed inset-0 z-50 flex items-center justify-center dim-screen p-4">
			<div className="bg-surface p-6 rounded-[8px] w-full max-w-[420px] relative">
				<button onClick={onClose} className="absolute top-5 right-5 text-text/60 hover:text-text"><X size={18} /></button>
				{!(tab === 'forgot' && msg) && <div className="flex justify-start mb-4"><Logo /></div>}
				{tab === 'login' && <h3 className="text-[20px] font-bold text-text mb-4">Sign In</h3>}
				{tab === 'register' && <h3 className="text-[20px] font-bold text-text mb-4">Create Account</h3>}
				{tab === 'reset' && <h3 className="text-[20px] font-bold text-text mb-4">Reset Password</h3>}
				{tab === 'forgot' && !msg && (
					<div className="mb-4">
						<h3 className="text-[20px] font-bold text-text">Forgot Password</h3>
						<p className="text-[13px] text-text/70 mt-0.5">Enter your La Verdad email to receive reset instructions.</p>
					</div>
				)}
				{tab === 'login' && (
					<>
						<form className="flex flex-col gap-2.5" onSubmit={handleLogin}>
							<TextInput label="La Verdad Email" type="email" autoComplete="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} error={emailErr} className={inputClass} />
							<PasswordInput label="Password" autoComplete="current-password" value={form.password || ''} onChange={(e) => set('password', e.target.value)} error={passErr} className={passwordClass} showPass={showPass} onToggleShow={() => setShowPass(!showPass)} action={<button type="button" onClick={() => { setTab('forgot'); setError('') }} className="text-[12px] text-primary hover:underline font-medium">Forgot password?</button>} />
							<button type="submit" disabled={!validLogin || loginSend.isPending} className={submitClass}>
								{loginSend.isPending ? 'Signing in...' : 'Sign In'}
							</button>
						</form>
						<div className="flex items-center gap-3 my-4">
							<div className="flex-1 h-[1px] bg-gray-200" />
							<span className="text-gray-400 text-[13px]">or</span>
							<div className="flex-1 h-[1px] bg-gray-200" />
						</div>
						<button type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`} className="w-full h-[44px] border border-gray-300 rounded-[8px] flex items-center justify-center gap-2 text-text text-[14px] font-medium hover:bg-gray-50 transition-colors">
							<svg className="w-4 h-4" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
							</svg>
							Continue with Google
						</button>
						<p className="text-center text-[13px] text-text/70 mt-4">
							Don't have an account? <button type="button" onClick={() => { setTab('register'); setError('') }} className="text-primary font-semibold hover:underline">Sign up</button>
						</p>
					</>
				)}
				{tab === 'register' && (
					<>
						<form className="flex flex-col gap-2.5" onSubmit={handleRegister}>
							<div className="grid grid-cols-2 gap-2.5">
								<TextInput label="First Name" type="text" value={form.firstname || ''} onChange={(e) => set('firstname', e.target.value)} className={inputClassSmall} />
								<TextInput label="Last Name" type="text" value={form.lastname || ''} onChange={(e) => set('lastname', e.target.value)} className={inputClassSmall} />
							</div>
							<TextInput label="La Verdad Email" type="email" autoComplete="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} error={error || getEmailError(form.email)} className={inputClassSmall} />
							<div className="grid grid-cols-2 gap-2.5">
								<TextInput label="Phone" type="tel" autoComplete="tel" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} error={getPhoneError(form.phone)} className={inputClassSmall} />
								<Field label="Department">
									<Select value={form.department || ''} onChange={(value) => set('department', value)} options={departments} placeholder="Select Department" error={departmentErr} panelClass="right-0 left-auto! w-[340px] bg-surface shadow-lg" hoverClass="hover:bg-[#BABABA]" selectedClass="bg-[#BBD7EE]" className="w-full bg-surface border border-gray-300 h-[40px] px-3 gap-2 text-[14px] text-text" />
									<ErrorText message={departmentErr} />
								</Field>
							</div>
							<PasswordInput label="Password" autoComplete="new-password" value={form.password || ''} onChange={(e) => set('password', e.target.value)} error={getPasswordError(form.password)} className={passwordClassSmall} showPass={showPass} onToggleShow={() => setShowPass(!showPass)} />
						<button type="submit" disabled={!validRegister || registerSend.isPending} className={submitClass}>
							{registerSend.isPending ? 'Creating account...' : 'Create Account'}
						</button>
						</form>
						<p className="text-[11px] text-gray-500 text-center mt-2.5">
							By registering, you agree to our <a href="/terms" className="text-primary hover:underline">Terms</a> and <a href="/privacy" className="text-primary hover:underline">Privacy</a>.
						</p>
						<p className="text-center text-[13px] text-text/70 mt-2.5">
							Already have an account? <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">Log in</button>
						</p>
					</>
				)}
				{tab === 'forgot' && (
					<>
						{msg ? (
							<div className="flex flex-col items-center gap-6">
								<Logo />
								<div className="flex flex-col items-center gap-2">
									<h4 className="text-[20px] font-bold text-text">Check Your Inbox</h4>
									<p className="text-[13px] text-text/70">We sent a password reset link to:</p>
									<p className="text-[14px] font-semibold text-primary break-all">{form.email}</p>
								</div>
								<button type="button" onClick={() => { setTab('login'); setMsg('') }} className="w-full bg-primary text-surface h-[44px] rounded-[8px] text-[15px] font-medium hover:opacity-90 transition-opacity">Back to Sign In</button>
							</div>
						) : (
							<form className="flex flex-col gap-2.5" onSubmit={handleForgot}>
								<TextInput label="La Verdad Email" type="email" autoComplete="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} error={error || getEmailError(form.email)} className={inputClass} />
								<button type="submit" disabled={!validForgot || forgotSend.isPending} className={submitClass}>
									{forgotSend.isPending ? 'Sending...' : 'Send Reset Link'}
								</button>
								<p className="text-center text-[13px] text-text/70 mt-4">
									Remember your password? <button type="button" onClick={() => { setTab('login'); setError('') }} className="text-primary font-semibold hover:underline">Back to Sign In</button>
								</p>
							</form>
						)}
					</>
				)}
				{tab === 'reset' && (
					<form className="flex flex-col gap-2.5" onSubmit={handleReset}>
						{error && (
							<div className="text-[13px] text-red-500 bg-red-50 p-2.5 rounded-[6px]">
								{error}
							</div>
						)}
						<PasswordInput label="New Password" autoComplete="new-password" value={form.password || ''} onChange={(e) => set('password', e.target.value)} error={getPasswordError(form.password)} className={passwordClass} showPass={showPass} onToggleShow={() => setShowPass(!showPass)} />
						<TextInput label="Confirm Password" type={showPass ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword || ''} onChange={(e) => set('confirmPassword', e.target.value)} error={getConfirmPasswordError(form.password, form.confirmPassword)} className={inputClass} />
						<button type="submit" disabled={!validReset || resetSend.isPending} className={submitClass}>
							{resetSend.isPending ? 'Updating password...' : 'Confirm Password'}
						</button>
						<p className="text-center text-[13px] text-text/70 mt-4">
							Remember your password? <button type="button" onClick={() => { setTab('login'); setError('') }} className="text-primary font-semibold hover:underline">Back to Sign In</button>
						</p>
					</form>
				)}
			</div>
		</div>
		<WelcomeToast show={toast.visible} message={toast.message} color="#22C55E" />
		</>
	)
}