'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function BankApplicationsPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLoans(data.data);
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchLoans();
      } else {
        alert(data.message || 'Failed to update loan status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating loan status');
    }
  };

  const filteredLoans = loans.filter((loan) => 
    loan.farmerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loan._id.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Loan Applications</h1>
          <p className="text-muted-foreground mt-1">Manage and track all agricultural loan requests.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by farmer name or ID..." 
            className="pl-9 bg-secondary/30 border-border/50 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card border-border/50">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="pl-6 py-4">Application ID</TableHead>
                  <TableHead className="py-4">Applicant</TableHead>
                  <TableHead className="py-4">Amount Requested</TableHead>
                  <TableHead className="py-4">Tenure</TableHead>
                  <TableHead className="py-4">Date</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="pr-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex justify-center mb-4">
                        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      </div>
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredLoans.length > 0 ? (
                  filteredLoans.map((loan: any) => (
                    <TableRow key={loan._id} className="hover:bg-secondary/10 transition-colors border-b border-border/50">
                      <TableCell className="pl-6 font-mono text-xs">{loan._id.substring(loan._id.length - 8).toUpperCase()}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{loan.farmerId?.name || 'Unknown Farmer'}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          Score: <span className="font-bold text-primary">{loan.farmerId?.trustScore || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-base">₹{loan.amountRequested.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>{loan.tenure} months</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          uppercase text-[10px] tracking-wider font-semibold px-2 py-0.5
                          ${loan.status === 'approved' ? 'text-green-500 border-green-500/30 bg-green-500/10' : ''}
                          ${loan.status === 'rejected' ? 'text-destructive border-destructive/30 bg-destructive/10' : ''}
                          ${loan.status === 'disbursed' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' : ''}
                          ${loan.status === 'pending' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' : ''}
                        `}>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {loan.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 rounded-lg text-green-600 border-green-600/30 hover:bg-green-600/10"
                              onClick={() => handleUpdateStatus(loan._id, 'approved')}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 rounded-lg text-rose-600 border-rose-600/30 hover:bg-rose-600/10"
                              onClick={() => handleUpdateStatus(loan._id, 'rejected')}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                        {loan.status === 'approved' && (
                          <Button 
                            size="sm" 
                            className="h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleUpdateStatus(loan._id, 'disbursed')}
                          >
                            Mark Disbursed
                          </Button>
                        )}
                        {['rejected', 'disbursed'].includes(loan.status) && (
                          <span className="text-xs text-muted-foreground italic">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
