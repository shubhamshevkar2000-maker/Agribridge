const fs = require("fs");
const path = require("path");

["buyer", "logistics", "bank", "admin"].forEach(role => {
  const filePath = `frontend/src/app/(dashboard)/${role}/layout.tsx`;
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, "utf8");
  
  // 1. Add imports
  if (!content.includes("useAuth")) {
    content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport ProtectedRoute from '@/components/ProtectedRoute';\nimport { useAuth } from '@/context/AuthContext';");
  }
  
  // 2. Add useAuth hook
  if (!content.includes("const { user, logout } = useAuth();")) {
    const layoutMatch = content.match(/export default function \w+Layout[^\{]+\{\n/);
    if (layoutMatch) {
      content = content.replace(layoutMatch[0], `${layoutMatch[0]}  const { user, logout } = useAuth();\n`);
    }
  }
  
  // 3. Update Sidebar Avatar
  content = content.replace(
    /<AvatarFallback[^>]*>.*?<\/AvatarFallback>/,
    `<AvatarFallback className="bg-primary/20 text-primary font-semibold">\n                {user?.name?.substring(0, 2).toUpperCase() || '${role.substring(0,2).toUpperCase()}'}\n              </AvatarFallback>`
  );
  
  // 4. Update Sidebar Name
  content = content.replace(
    /<span className="text-sm font-semibold truncate text-foreground">.*?<\/span>/,
    `<span className="text-sm font-semibold truncate text-foreground">{user?.name || 'Loading...'}</span>`
  );
  
  // 5. Add Logout Button
  if (!content.includes("onClick={logout}")) {
    content = content.replace(
      /<\/div>\n\s+<\/div>\n\s+\);\n\n\s+return/s,
      `  <Button variant="ghost" className={\`w-full flex items-center \${collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-2'} hover:bg-destructive/10 hover:text-destructive transition-colors\`} onClick={logout}>\n          <LogOut size={20} className="shrink-0" />\n          {!collapsed && <span>Log out</span>}\n        </Button>\n      </div>\n    </div>\n  );\n\n  return`
    );
  }
  
  // 6. Wrap in ProtectedRoute
  if (!content.includes("<ProtectedRoute")) {
    content = content.replace(
      /return \(\n\s+<div className="h-screen/s,
      `return (\n    <ProtectedRoute allowedRoles={['${role}']}>\n      <div className="h-screen`
    );
    // Add closing tag at the very end
    content = content.replace(/  \);\n\}\n?$/, "      </div>\n    </ProtectedRoute>\n  );\n}\n");
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${role}/layout.tsx`);
});
