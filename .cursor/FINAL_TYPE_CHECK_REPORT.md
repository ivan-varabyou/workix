





### tsconfig.spec.base.json
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "skipLibCheck": true,
    "suppressImplicitAnyIndexErrors": true
  }
}
```






## 📝 Commands for checks

```bash
npx tsc --noEmit

npx tsc --noEmit -p apps/app-web/tsconfig.spec.json
npx tsc --noEmit -p libs/shared/frontend/ui/tsconfig.spec.json
```
