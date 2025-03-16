'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  QrCodeScanner as ScannerIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    barcode: '',
    price: 0,
    description: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((product: Product) => product.category))
      );
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to load products', 'error');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setEditMode(true);
    } else {
      setCurrentProduct({
        name: '',
        category: '',
        barcode: '',
        price: 0,
        description: ''
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  const handleCategoryChange = (e: any) => {
    setCurrentProduct({
      ...currentProduct,
      category: e.target.value
    });
  };

  const handleSaveProduct = async () => {
    try {
      if (!currentProduct.name || !currentProduct.category) {
        showSnackbar('Name and category are required', 'error');
        return;
      }

      if (editMode) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: currentProduct.name,
            category: currentProduct.category,
            barcode: currentProduct.barcode,
            price: currentProduct.price,
            description: currentProduct.description
          })
          .eq('id', currentProduct.id);

        if (error) throw error;
        showSnackbar('Product updated successfully', 'success');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([
            {
              name: currentProduct.name,
              category: currentProduct.category,
              barcode: currentProduct.barcode,
              price: currentProduct.price,
              description: currentProduct.description
            }
          ]);

        if (error) throw error;
        showSnackbar('Product added successfully', 'success');
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;

        showSnackbar('Product deleted successfully', 'success');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showSnackbar('Failed to delete product', 'error');
      }
    }
  };

  const handleBarcodeScanner = () => {
    // In a real implementation, this would integrate with a barcode scanner
    // For now, we'll just show a mock implementation
    alert('Barcode scanner functionality would be implemented here.');
    // After scanning, you would set the barcode value in the currentProduct state
  };

  const handleImportFromWooCommerce = () => {
    // Mock implementation for WooCommerce import
    alert('WooCommerce import functionality would be implemented here.');
  };

  const handleImportFromCSV = () => {
    // Mock implementation for CSV import
    alert('CSV import functionality would be implemented here.');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  });

  const productsByCategory = categories.map(category => ({
    category,
    products: filteredProducts.filter(product => product.category === category)
  }));

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search Products"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Product
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScannerIcon />}
              onClick={handleBarcodeScanner}
            >
              Scan Barcode
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleImportFromWooCommerce}
            >
              Import from WooCommerce
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="product tabs">
            <Tab label="All Products" />
            {categories.map((category, index) => (
              <Tab key={category} label={category} />
            ))}
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Barcode</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.barcode || 'N/A'}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteProduct(product.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {productsByCategory.map((categoryData, index) => (
          <TabPanel key={categoryData.category} value={tabValue} index={index + 1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryData.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.barcode || 'N/A'}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(product)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteProduct(product.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        ))}
      </Paper>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={currentProduct.name}
              onChange={handleInputChange}
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={currentProduct.category}
                onChange={handleCategoryChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
                <MenuItem value="new">
                  <em>Add New Category</em>
                </MenuItem>
              </Select>
            </FormControl>
            
            {currentProduct.category === 'new' && (
              <TextField
                fullWidth
                label="New Category Name"
                name="category"
                value=""
                onChange={handleInputChange}
                required
              />
            )}
            
            <TextField
              fullWidth
              label="Barcode"
              name="barcode"
              value={currentProduct.barcode}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleBarcodeScanner}>
                      <ScannerIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={currentProduct.price}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={currentProduct.description}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 