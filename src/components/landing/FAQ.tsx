"use client"

import { useState } from "react"

export function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  const faqs = [
    {
      question: "Is this just another project management tool?",
      answer: "No! Project Graveyard is specifically designed for abandoned projects. Instead of helping you manage active work, we help you learn from dead projects to make better future decisions."
    },
    {
      question: "Do I need to connect my GitHub account?",
      answer: "Not for the beta! You can manually add projects to get started. GitHub integration is coming in a future update to automatically detect abandoned repositories."
    },
    {
      question: "Will other people see my failed projects?",
      answer: "Your graveyard is completely private by default. Only you can see your buried projects and insights. We may add optional sharing features later, but privacy is our priority."
    },
    {
      question: "How do you define an 'abandoned' project?",
      answer: "Any project you're no longer actively working on and don't plan to return to. It could be a side project, startup idea, learning exercise, or experiment that didn't pan out."
    },
    {
      question: "What if I want to revive a dead project?",
      answer: "Perfect! The platform will help you understand why it died originally and provide insights on whether revival makes sense. You can track revival attempts and their outcomes too."
    },
    {
      question: "How much does it cost?",
      answer: "The beta is completely free! We're focused on building the best possible product and gathering feedback. Pricing will come later, and beta users will get special benefits."
    },
    {
      question: "What kind of insights will I get?",
      answer: "You'll see patterns in why projects fail (scope, timing, tech choices), which technologies correlate with completion, seasonal trends in your productivity, and personalized recommendations for future projects."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! You own your data. You can export all your project information, post-mortems, and insights at any time. No vendor lock-in."
    },
    {
      question: "Is this meant to make me feel bad about failed projects?",
      answer: "Absolutely not! The goal is to transform guilt into growth. Every buried project becomes a lesson that makes you a better developer. We celebrate learning from failure."
    },
    {
      question: "How long does the beta last?",
      answer: "The beta will run for several months while we gather feedback and improve the product. Beta users will get advanced notice before any major changes or pricing announcements."
    }
  ]

  return (
    <section id="faq-section" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about turning your failures into wisdom.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="mb-4 glass-card rounded-xl overflow-hidden glass-hover"
            >
              <button
                className="w-full text-left p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-gray-100 pr-4">
                  {faq.question}
                </h3>
                <div className={`text-blue-400 text-2xl transform transition-transform duration-200 flex-shrink-0 ${openQuestion === index ? 'rotate-180' : ''}`}>
                  ⌄
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${openQuestion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/10">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions section */}
        <div className="mt-16 text-center">
          <div className="glass-card glass-gradient-blue rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-300 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 mb-6">
              We're here to help! Reach out to us and we'll get back to you quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:hello@projectgraveyard.com"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Contact Support
              </a>
              <span className="text-gray-400 text-sm">
                Usually respond within 24 hours
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}