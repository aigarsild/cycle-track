import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, CssBaseline } from '@mui/material';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bike Shop Service Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/dashboard" passHref>
              <Button color="inherit">Dashboard</Button>
            </Link>
            <Link href="/service-inquiry" passHref>
              <Button color="inherit">Service Inquiry</Button>
            </Link>
            <Link href="/workshop" passHref>
              <Button color="inherit">Workshop</Button>
            </Link>
            <Link href="/products" passHref>
              <Button color="inherit">Products</Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout; 