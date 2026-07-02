import React from 'react';
import Head from 'next/head';

const CopyrightNotice = () => {
  return (
    <>
      <Head>
        <title>Copyright Notice - GOAT Royalty App</title>
        <meta name="description" content="Copyright Notice for GOAT Royalty App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Copyright Notice</h1>
              <p className="text-sm text-gray-600 mt-2">
                Effective Date: December 19, 2024 | Last Updated: December 19, 2024
              </p>
            </div>

            <div className="prose max-w-none">
              <div className="bg-red-50 p-6 border-l-4 border-red-400 mb-6">
                <h2 className="text-xl font-semibold text-red-900 mb-4">Copyright Ownership</h2>
                <p className="text-red-800 mb-4">
                  GOAT Royalty App and all related materials, including but not limited to source code, user interface design, royalty calculation algorithms, music data processing methods, text, images, videos, database structures, documentation, trademarks, logos, and brand elements are owned by:
                </p>
                <p className="text-red-800 font-bold text-lg mb-4">
                  HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
                </p>
                <p className="text-red-800">
                  and are protected by copyright laws and international copyright treaties.
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Copyright © 2024</h2>
              <p className="text-gray-700 mb-6 bg-yellow-50 p-4 border-l-4 border-yellow-400">
                All rights reserved. Unauthorized use, reproduction, modification, distribution, or creation of derivative works is strictly prohibited without prior written consent from all owners.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Joint Ownership Statement</h2>
              <p className="text-gray-700 mb-6">
                This intellectual property is jointly owned by:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-2">HARVEY L MILLER JR</span>
                    <span className="text-gray-600">- Equal ownership interest</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-2">JUAQUIN J MALPHURS</span>
                    <span className="text-gray-600">- Equal ownership interest</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-2">KEVIN W HALLINGQUEST</span>
                    <span className="text-gray-600">- Equal ownership interest</span>
                  </li>
                </ul>
                <p className="text-red-600 font-semibold mt-4">
                  <strong>Important:</strong> All three owners must consent to any licensing, assignment, or transfer of rights.
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Protected Intellectual Property</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Software Components</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Source code and compiled software</li>
                  <li>User interface design and graphics</li>
                  <li>Royalty calculation algorithms</li>
                  <li>Music data processing methods</li>
                  <li>Text, images, videos, and audio content</li>
                  <li>Database structures and data</li>
                  <li>Documentation and manuals</li>
                  <li>Trademarks, logos, and brand elements</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Music Industry Specific IP</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>API endpoints and integration methods</li>
                  <li>Music industry specific features</li>
                  <li>Royalty calculation algorithms</li>
                  <li>Streaming platform integration methods</li>
                  <li>Music data processing systems</li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Permitted Uses</h2>
              <div className="bg-green-50 p-4 border-l-4 border-green-400 mb-6">
                <p className="text-gray-700 mb-4">You may:</p>
                <ul className="list-disc list-inside text-green-800">
                  <li>Use GOAT Royalty App for personal, non-commercial royalty management</li>
                  <li>Share links to our publicly available content</li>
                  <li>Make one copy of publicly available materials for personal reference</li>
                  <li>Use our API according to our API Terms of Service</li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
              <div className="bg-red-50 p-4 border-l-4 border-red-400 mb-6">
                <p className="text-gray-700 mb-4">You may not:</p>
                <ul className="list-disc list-inside text-red-800">
                  <li>Copy, modify, or distribute our software without permission</li>
                  <li>Use our trademarks or brand elements without written consent</li>
                  <li>Reverse engineer or decompile our royalty calculation algorithms</li>
                  <li>Create derivative works based on our proprietary methods</li>
                  <li>Use our content for commercial purposes without licensing agreement</li>
                  <li>Violate music industry licensing and regulations</li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Music Industry Specific Protections</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Royalty Calculation Algorithms</h3>
                <p className="text-gray-700 mb-4">
                  Our proprietary royalty calculation methods are protected intellectual property:
                </p>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Streaming data aggregation algorithms</li>
                  <li>Revenue distribution formulas</li>
                  <li>Multi-platform royalty calculation methods</li>
                  <li>Real-time processing systems</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Platform Integration Methods</h3>
                <p className="text-gray-700 mb-4">
                  Our integration methods with music platforms are proprietary:
                </p>
                <ul className="list-disc list-inside text-gray-700">
                  <li>API connection methods</li>
                  <li>Data parsing algorithms</li>
                  <li>Real-time synchronization processes</li>
                  <li>Error handling and data validation systems</li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">DMCA Compliance</h2>
              <p className="text-gray-700 mb-6">
                We respect the intellectual property rights of others. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please notify us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Copyright Agent:</h3>
                <p className="text-gray-700 mb-2">
                  <strong>HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST</strong>
                </p>
                <p className="text-gray-700 mb-2">[Your Address]</p>
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> copyright@goatroyaltyapp.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Music Industry Copyright</h2>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Music Industry Standards</h3>
                <p className="text-gray-700 mb-4">
                  We comply with music industry copyright standards:
                </p>
                <ul className="list-disc list-inside text-gray-700">
                  <li><strong>Performance Rights Organization (PRO) requirements</strong></li>
                  <li><strong>Music licensing compliance</strong></li>
                  <li><strong>Digital Service Provider (DSP) copyright standards</strong></li>
                  <li><strong>International copyright treaty compliance</strong></li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">License Inquiries</h2>
              <p className="text-gray-700 mb-6">
                For licensing requests, permissions, or other copyright-related questions, please contact:
              </p>
              <div className="bg-blue-50 p-4 border-l-4 border-blue-400 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Copyright Department:</h3>
                <p className="text-blue-700 mb-2">
                  <strong>Owners:</strong> HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
                </p>
                <p className="text-blue-700 mb-2">
                  <strong>Email:</strong> licensing@goatroyaltyapp.com
                </p>
                <p className="text-blue-700">
                  <strong>Website:</strong> https://goatroyaltyapp.com/copyright
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Enforcement</h2>
              <p className="text-gray-700 mb-6">
                Any violation of this copyright notice may result in:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6">
                <li>Immediate termination of service access</li>
                <li>Legal action for copyright infringement</li>
                <li>Seeking of statutory damages up to $150,000 per infringement</li>
                <li>Injunctive relief to prevent further violations</li>
                <li>Recovery of attorney's fees and court costs</li>
              </ul>

              <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">Important Legal Notice:</h3>
                <p className="text-yellow-700">
                  This copyright notice applies to all aspects of GOAT Royalty App, including but not limited to software, algorithms, documentation, and music industry specific methods. Unauthorized use may result in severe legal penalties.
                </p>
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

export default CopyrightNotice;