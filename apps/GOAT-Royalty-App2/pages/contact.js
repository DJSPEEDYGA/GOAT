import React, { useState } from 'react';
import Head from 'next/head';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message. We will respond within 24-48 hours.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    });
  };

  return (
    <>
      <Head>
        <title>Contact & DMCA - GOAT Royalty App</title>
        <meta name="description" content="Contact information and DMCA procedures for GOAT Royalty App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Contact & DMCA Information</h1>
              <p className="text-sm text-gray-600 mt-2">
                Last Updated: December 19, 2024
              </p>
            </div>

            {/* General Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">General Contact Information</h2>
              <div className="bg-blue-50 p-6 border-l-4 border-blue-400 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-3">GOAT Royalty App</h3>
                <p className="text-blue-800 mb-4">
                  <strong>Owners:</strong> HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
                </p>
                <div className="space-y-2">
                  <p className="text-blue-800">
                    <strong>Email:</strong> contact@goatroyaltyapp.com
                  </p>
                  <p className="text-blue-800">
                    <strong>Phone:</strong> [Your Phone Number]
                  </p>
                  <p className="text-blue-800">
                    <strong>Website:</strong> https://goatroyaltyapp.com
                  </p>
                </div>
                <p className="text-blue-700 mt-4 text-sm">
                  Business Hours: Monday - Friday 9:00 AM - 5:00 PM [Your Timezone]<br />
                  Response Time: Within 24-48 hours
                </p>
              </div>
            </div>

            {/* Support Channels */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Channels</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Technical Support</h3>
                  <p className="text-gray-700 text-sm mb-2">Account issues, login problems, technical bugs</p>
                  <p className="text-blue-600 text-sm">support@goatroyaltyapp.com</p>
                  <p className="text-gray-600 text-xs mt-1">Response: Within 24 hours</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Royalty Support</h3>
                  <p className="text-gray-700 text-sm mb-2">Royalty calculations, payments, data issues</p>
                  <p className="text-blue-600 text-sm">royalties@goatroyaltyapp.com</p>
                  <p className="text-gray-600 text-xs mt-1">Response: Within 48 hours</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Artist Support</h3>
                  <p className="text-gray-700 text-sm mb-2">Artist verification, content submission</p>
                  <p className="blue-600 text-sm">artists@goatroyaltyapp.com</p>
                  <p className="text-gray-600 text-xs mt-1">Response: Within 48 hours</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Business Inquiries</h3>
                  <p className="text-gray-700 text-sm mb-2">Partnerships, integrations, enterprise</p>
                  <p className="text-blue-600 text-sm">business@goatroyaltyapp.com</p>
                  <p className="text-gray-600 text-xs mt-1">Response: Within 48 hours</p>
                </div>
              </div>
            </div>

            {/* DMCA Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">DMCA Copyright Infringement Notice</h2>
              <div className="bg-red-50 p-6 border-l-4 border-red-400 rounded-lg">
                <p className="text-red-800 mb-4">
                  In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to claims of copyright infringement.
                </p>
                <h3 className="text-lg font-medium text-red-900 mb-3">Designated Copyright Agent:</h3>
                <div className="space-y-2 text-red-800">
                  <p><strong>Name:</strong> HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST</p>
                  <p><strong>Title:</strong> Copyright Agent</p>
                  <p><strong>Company:</strong> GOAT Royalty App</p>
                  <p><strong>Address:</strong> [Your Complete Business Address]</p>
                  <p><strong>Email:</strong> copyright@goatroyaltyapp.com</p>
                  <p><strong>Phone:</strong> [Copyright Hotline Phone Number]</p>
                </div>
              </div>
            </div>

            {/* DMCA Form */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit DMCA Notice</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type *
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="dmca">DMCA Copyright Notice</option>
                    <option value="technical">Technical Support</option>
                    <option value="royalty">Royalty Issue</option>
                    <option value="business">Business Partnership</option>
                    <option value="legal">Legal Matter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={formData.inquiryType === 'dmca' ? 
                      "Please include: 1) Description of copyrighted work, 2) Location of infringing material, 3) Your contact information, 4) Good faith statement, 5) Accuracy statement, 6) Electronic signature" : 
                      "Please describe your inquiry in detail..."}
                  />
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">DMCA Notice Requirements:</h3>
                  <ul className="text-xs text-gray-700 list-disc list-inside">
                    <li>Identification of the copyrighted work claimed to have been infringed</li>
                    <li>Identification of the material that is claimed to be infringing</li>
                    <li>Information reasonably sufficient to permit us to locate the material</li>
                    <li>Your contact information: name, address, telephone number, and email address</li>
                    <li>A statement that you have a good faith belief that the use is not authorized</li>
                    <li>A statement that the information in the notification is accurate</li>
                    <li>Your physical or electronic signature</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Submit Message
                </button>
              </form>
            </div>

            {/* Emergency Contacts */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Critical Legal Emergencies</h3>
                  <p className="text-yellow-800 text-sm mb-2">Urgent legal matters requiring immediate attention</p>
                  <p className="text-yellow-700 text-sm">emergency-legal@goatroyaltyapp.com</p>
                  <p className="text-yellow-600 text-xs mt-1">Available: 24/7 for critical issues</p>
                </div>
                <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Security Issues</h3>
                  <p className="text-yellow-800 text-sm mb-2">Security vulnerabilities, data breaches</p>
                  <p className="text-yellow-700 text-sm">security@goatroyaltyapp.com</p>
                  <p className="text-yellow-600 text-xs mt-1">Response: Immediate notification required</p>
                </div>
              </div>
            </div>

            {/* Music Industry Specific */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Music Industry Specific Contacts</h2>
              <div className="bg-purple-50 p-6 border-l-4 border-purple-400 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-purple-900 mb-2">Royalty Disputes</h3>
                    <p className="text-purple-800 text-sm mb-2">Calculation errors, payment issues</p>
                    <p className="text-purple-700 text-sm">royalty-disputes@goatroyaltyapp.com</p>
                    <p className="text-purple-600 text-xs mt-1">Response: Within 5 business days</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-900 mb-2">Rights Verification</h3>
                    <p className="text-purple-800 text-sm mb-2">Copyright ownership, publishing</p>
                    <p className="text-purple-700 text-sm">rights@goatroyaltyapp.com</p>
                    <p className="text-purple-600 text-xs mt-1">Response: Within 3 business days</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-900 mb-2">PRO Issues</h3>
                    <p className="text-purple-800 text-sm mb-2">ASCAP, BMI, SESAC, SoundExchange</p>
                    <p className="text-purple-700 text-sm">pro@goatroyaltyapp.com</p>
                    <p className="text-purple-600 text-xs mt-1">Response: Within 48 hours</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-900 mb-2">Platform Partnerships</h3>
                    <p className="text-purple-800 text-sm mb-2">Spotify, Apple Music, YouTube, TikTok</p>
                    <p className="text-purple-700 text-sm">platform-partnerships@goatroyaltyapp.com</p>
                    <p className="text-purple-600 text-xs mt-1">Response: Within 5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Time Commitments</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Standard Inquiries</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• General Inquiries: 24-48 hours</li>
                    <li>• Technical Support: 24 hours</li>
                    <li>• Royalty Issues: 48 hours</li>
                    <li>• Legal Matters: 48 hours</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Priority Issues</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• DMCA Notices: 24 hours</li>
                    <li>• Emergency Issues: 4 hours</li>
                    <li>• Security Breaches: Immediate</li>
                    <li>• Business Partnerships: 5 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Last Updated: December 19, 2024 | Version 1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;