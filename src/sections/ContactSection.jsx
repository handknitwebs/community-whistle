import { useState } from 'react'
import emailjs from '@emailjs/browser'

const defaultCopy = {
  title: 'Contact Us',
  intro: 'Have a question or suggestion? Use the form below to reach our site admins. We’ll respond as quickly as possible.',
  labels: {
    name: 'Your Name (required)',
    email: 'Email Address (required)',
    message: 'Your Message (required)'
  },
  placeholders: {
    name: 'Fran Wilson',
    email: 'name@domain.com',
    message: 'Please type your message here...'
  },
  submit: 'Submit',
  statusMessages: {
    requiredFields: 'Please fill out all required fields.',
    demoOnly: 'Thanks! This preview is for demo only—messages are not sent from this build.',
    missingConfig: 'Email service is not configured yet. Please try again later.',
    sent: 'Thanks! We received your message.',
    genericError: 'Something went wrong. Please try again later.',
    sending: 'Sending…'
  }
}

const ContactSection = ({ copy }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const contactEnabled = import.meta.env.VITE_CONTACT_ENABLED === 'true'
  const mergedCopy = {
    ...defaultCopy,
    ...(copy || {}),
    labels: { ...defaultCopy.labels, ...(copy?.labels || {}) },
    placeholders: { ...defaultCopy.placeholders, ...(copy?.placeholders || {}) },
    statusMessages: { ...defaultCopy.statusMessages, ...(copy?.statusMessages || {}) }
  }
  const statusMessages = mergedCopy.statusMessages
  const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  const emailJsServiceId = 'service_9gu61cf'
  const emailJsTemplateId = 'template_fn94ycm'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ state: 'error', message: statusMessages.requiredFields })
      return
    }

    if (!contactEnabled) {
      setStatus({
        state: 'sent',
        message: statusMessages.demoOnly
      })
      setFormData({ name: '', email: '', message: '' })
      return
    }

    setStatus({ state: 'sending', message: '' })

    if (!emailJsPublicKey) {
      setStatus({ state: 'error', message: statusMessages.missingConfig })
      return
    }

    try {
      await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          time: new Date().toLocaleString()
        },
        { publicKey: emailJsPublicKey }
      )

      setStatus({ state: 'sent', message: statusMessages.sent })
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus({ state: 'error', message: statusMessages.genericError })
    }
  }

  return (
    <section id="contact" className="panel contact-panel flex-container flex-dir-col">
      <h2 className="section-title archivo-800">{mergedCopy.title}</h2>
      <p className="body-medium roboto-400 text-center">
        {mergedCopy.intro}
      </p>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="name" className="roboto-400 body-medium">
          <span>{mergedCopy.labels.name}</span>
          <input
            id="name"
            type="text"
            name="name"
            placeholder={mergedCopy.placeholders.name}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label htmlFor="email" className="roboto-400 body-medium">
          <span>{mergedCopy.labels.email}</span>
          <input
            id="email"
            type="email"
            name="email"
            placeholder={mergedCopy.placeholders.email}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label htmlFor="message" className="roboto-400 body-medium">
          <span>{mergedCopy.labels.message}</span>
          <textarea
            id="message"
            name="message"
            rows="5"
            placeholder={mergedCopy.placeholders.message}
            value={formData.message}
            onChange={handleChange}
            required
          />
        </label>
        <button
          type="submit"
          className="submit-button hotline-button archivo-800 body-xlarge"
          disabled={status.state === 'sending'}
        >
          {status.state === 'sending' ? statusMessages.sending : mergedCopy.submit}
        </button>
        {status.state !== 'idle' && status.message && (
          <p
            className={`form-status body-medium roboto-400 ${status.state === 'error' ? 'form-status--error' : 'form-status--success'}`}
            role={status.state === 'error' ? 'alert' : undefined}
          >
            {status.message}
          </p>
        )}
      </form>
    </section>
  )
}

export default ContactSection
