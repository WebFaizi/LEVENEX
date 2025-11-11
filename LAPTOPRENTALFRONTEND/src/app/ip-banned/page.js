"use client";

import { ShieldBan, Mail, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IPBannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="bg-red-100 p-6 rounded-full">
              <ShieldBan className="h-20 w-20 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-700">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  Your IP Address Has Been Banned
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We've detected suspicious activity or a violation of our terms of service
                  from your IP address. As a result, your access to this website has been
                  temporarily or permanently restricted.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">
              Common reasons for IP bans:
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Multiple failed login attempts</li>
              <li>Automated bot or scraping activity</li>
              <li>Violation of terms of service</li>
              <li>Suspicious or malicious behavior</li>
              <li>Spam or abuse reports</li>
            </ul>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h4 className="font-semibold text-gray-900">
              What you can do:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700">
                    If you believe this is a mistake, please contact our support team at:
                  </p>
                  <a
                    href="mailto:support@laptoprental.co"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    support@laptoprental.co
                  </a>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> When contacting support, please include your IP
                  address and explain why you believe the ban should be lifted. Our team will
                  review your request and respond within 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-8"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
