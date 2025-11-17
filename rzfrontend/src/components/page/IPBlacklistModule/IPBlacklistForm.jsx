import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiPost, apiPut } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const IPBlacklistForm = ({ editingIp, onSuccess, onCancel, currentUserIp }) => {
  const [showOwnIpWarning, setShowOwnIpWarning] = useState(false);

  const ipValidationSchema = Yup.object({
    ip_address: Yup.string()
      .required("IP Address is required")
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        "Invalid IP address format"
      ),
    status: Yup.string().required("Status is required"),
    reason: Yup.string(),
    banned_by: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      ip_address: "",
      status: "allowed",
      reason: "",
      banned_by: "",
    },
    validationSchema: ipValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        
        let res;
        if (editingIp) {
          // For update, only send ip_blacklist_id and the fields being updated
          formData.append("ip_blacklist_id", editingIp._id);
          formData.append("status", values.status);
          formData.append("reason", values.reason);
          formData.append("banned_by", values.banned_by);
          res = await apiPut("/ip-blacklist", formData);
        } else {
          // For add, send all fields including ip_address
          formData.append("ip_address", values.ip_address);
          formData.append("status", values.status);
          formData.append("reason", values.reason);
          formData.append("banned_by", values.banned_by);
          res = await apiPost("/ip-blacklist", formData);
        }

        if (res.status === 1) {
          toast.success(res.message);
          resetForm();
          if (onSuccess) onSuccess();
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingIp) {
      formik.setValues({
        ip_address: editingIp.ip_address || "",
        status: editingIp.status || "allowed",
        reason: editingIp.reason || "",
        banned_by: editingIp.banned_by || "",
      });
    }
  }, [editingIp]);

  // Check if user is trying to ban their own IP
  useEffect(() => {
    if (currentUserIp && formik.values.ip_address === currentUserIp && formik.values.status === 'banned') {
      setShowOwnIpWarning(true);
    } else {
      setShowOwnIpWarning(false);
    }
  }, [formik.values.ip_address, formik.values.status, currentUserIp]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        {showOwnIpWarning && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-yellow-900 text-sm">
                Warning: You are about to ban your own IP address!
              </p>
              <p className="text-yellow-800 text-xs">
                If you proceed, you will be immediately blocked from accessing this website. 
                Make sure you have another way to access the admin panel (different network, VPN, etc.) 
                before confirming this action.
              </p>
            </div>
          </div>
        )}

        <div>
          <Label
            htmlFor="ip_address"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            IP Address *
          </Label>
          <Input
            name="ip_address"
            type="text"
            placeholder="192.168.1.1"
            className="w-full border rounded px-3 py-2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.ip_address}
            disabled={editingIp && editingIp.ip_address}
          />
          {formik.touched.ip_address && formik.errors.ip_address && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.ip_address}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="status"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Status *
          </Label>
          <Select
            name="status"
            value={formik.values.status}
            onValueChange={(value) => formik.setFieldValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allowed">Allowed</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.status && formik.errors.status && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.status}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="reason"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Reason
          </Label>
          <Textarea
            name="reason"
            placeholder="Enter reason for banning/allowing this IP..."
            className="w-full border rounded px-3 py-2 min-h-[100px]"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.reason}
          />
          {formik.touched.reason && formik.errors.reason && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.reason}
            </div>
          )}
        </div>

        <div>
          <Label
            htmlFor="banned_by"
            className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1"
          >
            Banned By
          </Label>
          <Input
            name="banned_by"
            type="text"
            placeholder="Admin name"
            className="w-full border rounded px-3 py-2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.banned_by}
          />
          {formik.touched.banned_by && formik.errors.banned_by && (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.banned_by}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingIp ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{editingIp ? "Update IP" : "Add IP"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IPBlacklistForm;
