"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Plus, Search, Edit, ShieldCheck, ShieldBan } from "lucide-react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { DeleteConfirmationDialog } from "@/components/customComponents/DeleteDialog";
import CustomModal from "@/components/customComponents/CustomModal";
import IPBlacklistForm from "./IPBlacklistForm";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";

const ManageIPBlacklist = () => {
  const [ipList, setIpList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(25);
  const [totalIps, setTotalIps] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalIps: 0, bannedIps: 0, allowedIps: 0 });
  const [currentUserIp, setCurrentUserIp] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    ip: null,
    loading: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIp, setEditingIp] = useState(null);

  // Fetch current user's IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setCurrentUserIp(data.ip))
      .catch(err => console.error('Failed to fetch IP:', err));
  }, []);

  const fetchIpList = async () => {
    setLoading(true);
    try {
      const url = `/ip-blacklist?search=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&limit=${selectedLimit}`;
      const response = await apiGet(url);
      setIpList(response.data.data || []);
      setTotalIps(response.data.totalLists || 0);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      setIpList([]);
      setTotalIps(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await apiGet("/ip-blacklist-stats");
      if (response.status === 1) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchIpList();
    fetchStats();
  }, [searchTerm, currentPage, selectedLimit]);

  const handleDeleteIp = (ip) => {
    setDeleteDialog({ open: true, ip, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.laptoprental.co/api/v1";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const formData = new FormData();
      formData.append("ip_blacklist_ids[]", deleteDialog.ip._id);
      
      const response = await axios({
        method: 'DELETE',
        url: `${API_BASE_URL}/ip-blacklist`,
        data: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      if (response.data.status === 1) {
        toast.success(response.data.message);
        setDeleteDialog({ open: false, ip: null, loading: false });
        fetchIpList();
        fetchStats();
      } else {
        toast.error(response.data.message);
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete IP");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAddNew = () => {
    setEditingIp(null);
    setModalOpen(true);
  };

  const handleEdit = (ip) => {
    setEditingIp(ip);
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingIp(null);
    fetchIpList();
    fetchStats();
  };

  const handleToggleStatus = async (ip) => {
    // Warn if trying to ban own IP
    if (currentUserIp && ip.ip_address === currentUserIp && ip.status === 'allowed') {
      const confirmed = window.confirm(
        `⚠️ WARNING: You are about to ban your own IP address (${currentUserIp})!\n\n` +
        `If you proceed, you will be immediately blocked from accessing this website.\n\n` +
        `Make sure you have another way to access the admin panel before confirming.\n\n` +
        `Do you want to continue?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("ip_blacklist_id", ip._id);
      formData.append("status", ip.status === "banned" ? "allowed" : "banned");
      formData.append("reason", ip.reason || "");
      formData.append("banned_by", ip.banned_by || "");

      const res = await apiPut("/ip-blacklist", formData);
      if (res.status === 1) {
        toast.success(res.message);
        fetchIpList();
        fetchStats();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to update IP status");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "banned") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldBan className="h-3 w-3" />
          Banned
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="flex items-center gap-1 bg-green-500 text-white">
        <ShieldCheck className="h-3 w-3" />
        Allowed
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current IP Info Banner */}
      {currentUserIp && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-blue-900">Your Current IP:</span>
              <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono">
                {currentUserIp}
              </code>
              <span className="text-blue-700 text-xs ml-2">
                (This is the IP that will be checked for bans)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Banned IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bannedIps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Allowed IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.allowedIps}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>IP Blacklist Management</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add New IP
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedLimit.toString()}
              onValueChange={(value) => setSelectedLimit(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Banned By</TableHead>
                      <TableHead>Banned At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No IP addresses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      ipList.map((ip) => (
                        <TableRow key={ip._id}>
                          <TableCell className="font-medium">
                            {ip.ip_address}
                          </TableCell>
                          <TableCell>{getStatusBadge(ip.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {ip.reason || "-"}
                          </TableCell>
                          <TableCell>{ip.banned_by || "-"}</TableCell>
                          <TableCell>
                            {ip.banned_at
                              ? new Date(ip.banned_at).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(ip)}
                              >
                                {ip.status === "banned" ? (
                                  <>
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Allow
                                  </>
                                ) : (
                                  <>
                                    <ShieldBan className="mr-1 h-3 w-3" />
                                    Ban
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(ip)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteIp(ip)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <CustomModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingIp(null);
        }}
        title={editingIp ? "Edit IP Address" : "Add New IP Address"}
      >
        <IPBlacklistForm
          editingIp={editingIp}
          currentUserIp={currentUserIp}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setModalOpen(false);
            setEditingIp(null);
          }}
        />
      </CustomModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, ip: null, loading: false })}
        onConfirm={confirmDelete}
        loading={deleteDialog.loading}
        title="Delete IP Address"
        description={`Are you sure you want to delete the IP address "${deleteDialog.ip?.ip_address}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ManageIPBlacklist;
