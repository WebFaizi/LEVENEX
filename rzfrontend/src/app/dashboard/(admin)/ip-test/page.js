"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { apiGet } from "@/lib/api";

export default function IPTestPage() {
  const [clientIp, setClientIp] = useState("");
  const [backendIp, setBackendIp] = useState(null);
  const [banStatus, setBanStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClientIp = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setClientIp(data.ip);
    } catch (error) {
      console.error("Failed to fetch client IP:", error);
    }
  };

  const fetchBackendIp = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/my-ip");
      setBackendIp(res.data);
    } catch (error) {
      console.error("Failed to fetch backend IP:", error);
    }
    setLoading(false);
  };

  const checkBanStatus = async () => {
    if (!backendIp?.detectedIp) return;
    
    try {
      const res = await apiGet(`/check-ip-banned?ip_address=${backendIp.detectedIp}`);
      setBanStatus(res.data);
    } catch (error) {
      console.error("Failed to check ban status:", error);
    }
  };

  useEffect(() => {
    fetchClientIp();
    fetchBackendIp();
  }, []);

  useEffect(() => {
    if (backendIp?.detectedIp) {
      checkBanStatus();
    }
  }, [backendIp]);

  const refresh = () => {
    fetchClientIp();
    fetchBackendIp();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">IP Detection Test</h1>
        <Button onClick={refresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {/* Client IP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Public IP (from ipify.org)</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded block">
              {clientIp || "Loading..."}
            </code>
            <p className="text-sm text-gray-500 mt-2">
              This is your IP as seen by external services
            </p>
          </CardContent>
        </Card>

        {/* Backend Detected IP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">IP Detected by Backend</CardTitle>
          </CardHeader>
          <CardContent>
            {backendIp ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-1">Detected IP (Used for ban check):</p>
                  <code className="text-2xl font-mono bg-blue-100 px-4 py-2 rounded block">
                    {backendIp.detectedIp}
                  </code>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold mb-2">Raw Headers:</p>
                  <div className="space-y-1 text-sm font-mono bg-gray-50 p-3 rounded">
                    <div><span className="text-gray-600">x-forwarded-for:</span> {backendIp.headers['x-forwarded-for'] || "not set"}</div>
                    <div><span className="text-gray-600">x-real-ip:</span> {backendIp.headers['x-real-ip'] || "not set"}</div>
                    <div><span className="text-gray-600">cf-connecting-ip:</span> {backendIp.headers['cf-connecting-ip'] || "not set"}</div>
                    <div><span className="text-gray-600">req.ip:</span> {backendIp.reqIp || "not set"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* Ban Status */}
        {banStatus && (
          <Card className={banStatus.isBanned ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {banStatus.isBanned ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700">IP is BANNED</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">IP is NOT BANNED</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {banStatus.isBanned && banStatus.reason && (
                <div>
                  <p className="text-sm font-semibold">Reason:</p>
                  <p className="text-sm text-red-800">{banStatus.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">How to Test IP Banning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>Note the <strong>"IP Detected by Backend"</strong> above</li>
              <li>Go to <strong>/dashboard/ip-blacklist</strong></li>
              <li>Add that IP with status "Banned"</li>
              <li>Refresh this page - you should be redirected to /ip-banned</li>
              <li>Any API calls will return 403 errors</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold text-yellow-900">Important:</p>
              <p className="text-yellow-800">
                If the "Public IP" and "Backend Detected IP" are different, use the 
                <strong> Backend Detected IP</strong> for testing bans, as that's what 
                the middleware actually checks.
              </p>
            </div>

            {backendIp?.detectedIp === '127.0.0.1' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded">
                <p className="font-semibold text-blue-900">Localhost Detection:</p>
                <p className="text-blue-800 text-sm">
                  You're accessing from localhost (127.0.0.1). The backend has 
                  <strong> ALLOW_LOCALHOST_BAN=true</strong> enabled, so banning 127.0.0.1 
                  will work for testing. In production, you should ban actual public IPs.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
