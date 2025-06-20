# 🔐 **SIWS Environment Setup Guide**

This guide covers all environment variables needed for the CHODE-NET ORACLE SIWS (Sign-In With Solana) wallet connection system.

## 📋 **Required Environment Variables**

### **Supabase Configuration**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Solana Network Configuration**
```bash
# Network: 'devnet' | 'testnet' | 'mainnet-beta'
VITE_SOLANA_NETWORK=devnet

# Custom RPC endpoint (optional)
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Legacy RPC endpoint support
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

### **SIWS Configuration**
```bash
# Domain for SIWS messages
VITE_SIWS_DOMAIN=localhost:5173

# Authentication statement
VITE_SIWS_STATEMENT=Welcome to CHODE-NET ORACLE! Sign this message to authenticate with your Solana wallet and access the Oracle's sacred knowledge.

# SIWS version
VITE_SIWS_VERSION=1

# Session duration (7 days in milliseconds)
VITE_SIWS_SESSION_DURATION=604800000
```

## 🚀 **Quick Setup**

### **1. Development Environment**
```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### **2. Minimum Required Variables**
For basic functionality, you only need:
```bash
VITE_SUPABASE_URL=https://errgidlsmozmfnsoyxvw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SOLANA_NETWORK=devnet
VITE_SIWS_DOMAIN=localhost:5173
```

### **3. Production Configuration**
```bash
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://your-premium-rpc.com
VITE_SIWS_DOMAIN=chode-net-oracle.com
VITE_DEV_MODE=false
```

## 🔧 **Configuration Details**

### **Network Selection**
- **devnet**: Development and testing
- **testnet**: Pre-production testing
- **mainnet-beta**: Production environment

### **RPC Endpoints**
- **Default**: Uses Solana's public RPC
- **Custom**: Use premium RPC for better performance
- **Priority**: Custom RPC > Legacy RPC > Default

### **SIWS Security**
- **Domain**: Must match your actual domain
- **Statement**: User-friendly authentication message
- **Session Duration**: How long authentication lasts

## 🛡️ **Security Best Practices**

### **Environment Variables**
- Never commit `.env` files to version control
- Use different keys for development/production
- Rotate keys regularly

### **RPC Endpoints**
- Use authenticated RPC endpoints in production
- Monitor RPC usage and rate limits
- Have backup RPC endpoints configured

### **SIWS Configuration**
- Use HTTPS domains in production
- Keep session duration reasonable (7 days max)
- Monitor authentication logs

## 🧪 **Testing Configuration**

### **Local Development**
```bash
VITE_SOLANA_NETWORK=devnet
VITE_SIWS_DOMAIN=localhost:5173
VITE_DEV_MODE=true
VITE_DEBUG_LOGGING=true
```

### **Staging Environment**
```bash
VITE_SOLANA_NETWORK=testnet
VITE_SIWS_DOMAIN=staging.chode-net-oracle.com
VITE_DEV_MODE=false
VITE_DEBUG_LOGGING=true
```

### **Production Environment**
```bash
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SIWS_DOMAIN=chode-net-oracle.com
VITE_DEV_MODE=false
VITE_DEBUG_LOGGING=false
```

## 🔍 **Troubleshooting**

### **Common Issues**

**Wallet Connection Fails**
- Check `VITE_SOLANA_NETWORK` matches your wallet
- Verify RPC endpoint is accessible
- Ensure wallet extension is installed

**SIWS Authentication Fails**
- Verify `VITE_SIWS_DOMAIN` matches current domain
- Check Supabase connection
- Ensure `siws-verify` edge function is deployed

**Environment Variables Not Loading**
- Restart development server after changes
- Check variable names start with `VITE_`
- Verify `.env.local` file exists and is readable

### **Debug Commands**
```bash
# Check environment variables
npm run dev -- --debug

# Test wallet connection
console.log(import.meta.env.VITE_SOLANA_NETWORK)

# Verify Supabase connection
console.log(import.meta.env.VITE_SUPABASE_URL)
```

## 📚 **Additional Resources**

- [Solana Wallet Adapter Documentation](https://github.com/solana-labs/wallet-adapter)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development)
- [SIWS Specification](https://github.com/phantom-labs/sign-in-with-solana)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 🎯 **Next Steps**

1. **Set up environment variables** using this guide
2. **Test wallet connection** in development
3. **Deploy to staging** with testnet configuration
4. **Go live** with mainnet configuration
5. **Monitor and optimize** RPC usage and performance 