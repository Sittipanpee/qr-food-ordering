'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/mock-api';
import { Table } from '@/lib/types';
import QRCode from 'qrcode';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await api.tables.getAll();
      // Sort by table number
      const sorted = data.sort((a, b) => {
        const aNum = parseInt(a.table_number) || 0;
        const bNum = parseInt(b.table_number) || 0;
        return aNum - bNum;
      });
      setTables(sorted);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (tableId: string, tableNumber: string) => {
    try {
      // Generate QR code URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const orderUrl = `${baseUrl}/customer?table=${tableNumber}`;

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(orderUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      // Edit mode
      setEditingTable(table);
      setTableNumber(table.table_number);
      setIsActive(table.is_active);
    } else {
      // Create mode
      setEditingTable(null);
      const nextNumber = tables.length + 1;
      setTableNumber(nextNumber.toString());
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTable(null);
    setTableNumber('');
    setIsActive(true);
  };

  const handleSave = async () => {
    if (!tableNumber.trim()) {
      alert('Please enter table number');
      return;
    }

    // Check for duplicate table number
    const duplicate = tables.find(
      (t) => t.table_number === tableNumber && t.id !== editingTable?.id
    );

    if (duplicate) {
      alert('Table number already exists');
      return;
    }

    try {
      // Generate QR code
      const qrCode = await generateQRCode('temp', tableNumber);

      if (editingTable) {
        // Update existing table
        await api.tables.update(editingTable.id, {
          table_number: tableNumber.trim(),
          is_active: isActive,
          qr_code: qrCode,
        });
      } else {
        // Create new table
        await api.tables.create({
          table_number: tableNumber.trim(),
          is_active: isActive,
          qr_code: qrCode,
        });
      }

      handleCloseDialog();
      loadTables();
    } catch (error) {
      console.error('Error saving table:', error);
      alert('Failed to save table');
    }
  };

  const handleDelete = async (table: Table) => {
    const confirmed = confirm(
      `Delete Table ${table.table_number}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.tables.delete(table.id);
      loadTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table');
    }
  };

  const handleToggleActive = async (table: Table) => {
    try {
      await api.tables.update(table.id, {
        is_active: !table.is_active,
      });
      loadTables();
    } catch (error) {
      console.error('Error toggling table status:', error);
    }
  };

  const handleShowQR = async (table: Table) => {
    setSelectedTable(table);

    // Generate QR if not exists
    let qr = table.qr_code;
    if (!qr) {
      qr = await generateQRCode(table.id, table.table_number);
      // Update table with QR code
      await api.tables.update(table.id, { qr_code: qr });
      loadTables();
    }

    setQrCodeUrl(qr || '');
    setQrDialogOpen(true);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !selectedTable) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `table-${selectedTable.table_number}-qr.png`;
    link.click();
  };

  const handleDownloadAllQR = async () => {
    if (tables.length === 0) return;

    const confirmed = confirm(
      `Download QR codes for all ${tables.length} tables?\n\nThis will download multiple files.`
    );

    if (!confirmed) return;

    // Download each QR code
    for (const table of tables) {
      let qr = table.qr_code;
      if (!qr) {
        qr = await generateQRCode(table.id, table.table_number);
      }

      const link = document.createElement('a');
      link.href = qr;
      link.download = `table-${table.table_number}-qr.png`;
      link.click();

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const handleRegenerateQR = async (table: Table) => {
    const confirmed = confirm(
      `Regenerate QR code for Table ${table.table_number}?`
    );

    if (!confirmed) return;

    try {
      const qr = await generateQRCode(table.id, table.table_number);
      await api.tables.update(table.id, { qr_code: qr });
      loadTables();
      alert('QR code regenerated successfully');
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      alert('Failed to regenerate QR code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading tables...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage tables and generate QR codes for ordering
          </p>
        </div>

        <div className="flex gap-2">
          {tables.length > 0 && (
            <Button variant="outline" onClick={handleDownloadAllQR}>
              Download All QR Codes
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                + Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </DialogTitle>
                <DialogDescription>
                  {editingTable
                    ? 'Update table information'
                    : 'Create a new table with QR code'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="table_number">Table Number *</Label>
                  <Input
                    id="table_number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g., 1, A1, VIP-1"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingTable ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tables.filter((t) => t.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tables.filter((t) => t.qr_code).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tables.filter((t) => !t.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No tables yet</p>
            <Button onClick={() => handleOpenDialog()}>
              Create Your First Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Table {table.table_number}
                      {!table.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {table.qr_code ? 'QR Code ready' : 'No QR code'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleShowQR(table)}
                    className="w-full"
                  >
                    View QR Code
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(table)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={table.is_active ? 'outline' : 'default'}
                      onClick={() => handleToggleActive(table)}
                    >
                      {table.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerateQR(table)}
                    >
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(table)}
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              QR Code - Table {selectedTable?.table_number}
            </DialogTitle>
            <DialogDescription>
              Scan this QR code to order from this table
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            {qrCodeUrl ? (
              <>
                <div className="bg-white p-4 rounded-lg border">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code for Table ${selectedTable?.table_number}`}
                    className="w-64 h-64"
                  />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Table {selectedTable?.table_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeof window !== 'undefined'
                      ? `${window.location.origin}/customer?table=${selectedTable?.table_number}`
                      : ''}
                  </p>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleDownloadQR}>
                    Download QR Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setQrDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Loading QR code...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
