"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function GoogleApiKeyDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/user/setting/api-keys">
            <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
            Getting a Google AI Studio API Key
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Learn how to obtain a free API key from Google AI Studio to use with Gemini models.
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Overview
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Google AI Studio provides free access to Gemini models through API keys. 
              These keys allow you to integrate Google's AI capabilities into your applications 
              without requiring a credit card or complex setup.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The free tier includes generous rate limits suitable for development and small-scale production use.
            </p>
          </section>

    

          {/* Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Step-by-Step Guide
            </h2>

            {/* Step 1 */}
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                1. Navigate to Google AI Studio
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Open your browser and visit the Google AI Studio API keys page:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4">
                <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                  https://aistudio.google.com/app/apikey
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                className="text-gray-700 dark:text-gray-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google AI Studio
              </Button>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                2. Sign In
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you're not already signed in, you'll be prompted to authenticate with your 
                Google account. Use any Google account—no special developer account is required.
              </p>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                3. Create an API Key
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                On the API keys page:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Click the <strong>Create API key</strong> button</li>
                <li>Select <strong>Create API key in new project</strong> (or choose an existing Google Cloud project if you have one)</li>
                <li>Your API key will be generated immediately</li>
              </ol>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Note:</strong> For most users, selecting "Create API key in new project" is the simplest option.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                4. Copy Your API Key
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Once created, your API key will be displayed on screen. Click the copy icon 
                to copy it to your clipboard. The key will look similar to this:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4">
                <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                  AIzaSyD••••••••••••••••••••••••••••
                </code>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-900 dark:text-red-200">
                  <strong>Security Warning:</strong> Treat your API key like a password. 
                  Never commit it to version control, share it publicly, or expose it in client-side code. 
                  If compromised, delete the key immediately and generate a new one.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                5. Add to Your Account
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Return to the API Keys page and add your newly created key:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Click <strong>Add API Key</strong></li>
                <li>Select <strong>Gemini</strong> as the provider</li>
                <li>Choose your preferred model (e.g., <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">gemini-1.5-flash</code> or <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">gemini-1.5-pro</code>)</li>
                <li>Paste your API key</li>
                <li>Click <strong>Add API Key</strong></li>
              </ol>
              <Link href="/user/setting/api-keys">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900">
                  Go to API Keys
                </Button>
              </Link>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Rate Limits
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Google AI Studio's free tier includes the following limits:
            </p>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Limit Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Requests per minute</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">15</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Requests per day</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              These limits are suitable for development and small-scale production applications. 
              For higher quotas, consider upgrading to a paid Google Cloud tier.
            </p>
          </section>

          {/* Troubleshooting */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Troubleshooting
            </h2>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Invalid API Key Error
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ensure you've copied the entire API key without extra spaces. 
                  Google AI Studio keys always start with <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">AIzaSy</code>.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Rate Limit Exceeded
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You've exceeded the free tier limits. Wait for the rate limit window to reset 
                  (1 minute for per-minute limits, 24 hours for daily limits) or upgrade to a paid tier.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Lost API Key
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  API keys are only displayed once during creation. If you've lost your key, 
                  generate a new one and delete the old key for security purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Related Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Related Resources
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  Gemini API Documentation
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  Google AI Studio
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </li>
              <li>
                <Link 
                  href="/user/setting/api-keys"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Manage Your API Keys
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

