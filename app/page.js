'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Grid, Modal, Stack, TextField, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { Pie } from 'react-chartjs-2';
import { firestore } from '@/firebase';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Chart from 'chart.js/auto';

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    const fetchInventory = async () => {
      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
    };

    fetchInventory();
  }, []);

  const handleOpen = () => {
    setCurrentItemId(null);
    setItemName('');
    setItemCategory('');
    setItemQuantity(1);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSaveItem = async () => {
    if (!itemName.trim()) return;

    const category = itemCategory.trim() === '' ? 'Uncategorized' : itemCategory;

    const itemData = {
      name: itemName,
      category: category,
      quantity: itemQuantity,
    };

    try {
      if (currentItemId) {
        const itemRef = doc(firestore, 'inventory', currentItemId);
        await updateDoc(itemRef, itemData);
      } else {
        const newItemRef = doc(collection(firestore, 'inventory'));
        await setDoc(newItemRef, itemData);
      }

      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInventory(items);

      handleClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(firestore, 'inventory', item.id));

      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const pieChartData = {
    labels: [...new Set(inventory.map(item => item.category))],
    datasets: [{
      data: inventory.reduce((acc, item) => {
        const categoryIndex = acc.labels.indexOf(item.category);
        if (categoryIndex >= 0) {
          acc.data[categoryIndex] += item.quantity;
        } else {
          acc.labels.push(item.category);
          acc.data.push(item.quantity);
        }
        return acc;
      }, { labels: [], data: [] }).data,
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    }]
  };

  const columns = [
    { field: 'name', headerName: 'Item Name', width: 150 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => {
            setCurrentItemId(params.row.id);
            setItemName(params.row.name);
            setItemCategory(params.row.category);
            setItemQuantity(params.row.quantity);
            setOpen(true);
          }}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '95vh' }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Pantry Pal
      </Typography>
      <Grid container spacing={3} sx={{ maxWidth: '1200px', width: '100%' }}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ bgcolor: 'white', p: 7, borderRadius: 2, boxShadow: 1, height: 500 }}>
            <Typography fontSize={18} color="#333">Inventory Categories</Typography>
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} height={400} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1, height: 500, overflow: 'hidden' }}>
            <Typography variant="h6" color="#333" gutterBottom sx={{ mt: 0, mb: 1 }}>
              Inventory List
            </Typography>
            <Box sx={{ height: '95%', overflowY: 'scroll' }}>
              <DataGrid
                rows={inventory}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 3 }} onClick={handleOpen}>
        Add New Item
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'white', borderRadius: 2, boxShadow: 24, p: 4
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentItemId ? 'Edit Item' : 'Add New Item'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Category"
              variant="outlined"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              fullWidth
            />
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              fullWidth
            />
            <Button variant="contained" onClick={handleSaveItem}>
              {currentItemId ? 'Update' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
