# Contexto de Integración y Estado del Proyecto (Para Gemini CLI)

## 1. Resumen de lo que ya se hizo
- **Merge y Resolución de Conflictos**: Se resolvieron múltiples conflictos de merge entre la rama `main` y la rama `luisdev`. El objetivo principal era adoptar la nueva arquitectura en vistas de `main` (`src/views/search/SearchView.tsx`, `src/views/report/ReportView.tsx`), pero respetando los cambios de UI y lógica agregados recientemente por el usuario en `luisdev`.
- **Integración de API Key**: Se actualizó `api.ts` para inyectar automáticamente `VITE_API_KEY` (usando la cabecera `X-API-Key`) a las solicitudes (función requerida para backend público).
- **Correcciones de Sintaxis y Dependencias**:
  - Se corrigió un fallo tipográfico en `ReportView.tsx` y en `index.css`.
  - Se restauró el hook `useFormDraft.ts` en `src/components/form/useFormDraft.ts` (estaba perdido).
  - Se corrigieron las importaciones de componentes de interfaz (por ejemplo, importaciones de `Button`).
  - Se corrió exitosamente `npm install` (instalando `heic2any`) y `npm run build` sin errores.

## 2. El Problema Actual (El "Cruce")
En la rama `luisdev`, en los commits `559b2d05...`, `531895b9...` y `67334f0b...`, el usuario refactorizó el diseño general e introdujo:
1. **`OnboardingView.tsx`**: Una pantalla principal con un fondo completo (`fondo.png`) con dos grandes botones para "Buscar" o "Reportar".
2. **`MenuView.tsx`**: Un menú que funciona junto al "Hamburger Menu".
3. **`SearchResultsList.tsx`**: Una mejora en el renderizado y estilo de la lista de resultados de la búsqueda de personas.

Al aceptar la arquitectura de la rama `main` (que renderiza vistas tabulares a través del componente `App.tsx` modificado y procesa la búsqueda internamente en `SearchView.tsx`), estos **nuevos componentes de vista fueron temporalmente aislados**. 

El usuario quiere **ver y usar estas nuevas vistas (OnboardingView, MenuView, SearchResultsList)** incrustadas en la arquitectura actual.

## 3. Plan de Implementación a Ejecutar (Lo que debes hacer)

Tu tarea, Gemini, es tomar los componentes mencionados arriba y conectarlos al flujo actual:

### Paso A: Actualizar `src/App.tsx`
1. **Actualizar el tipo `Tab`**: Expandirlo a `type Tab = 'inicio' | 'buscar' | 'reportar' | 'api' | 'testimonios';`
2. **Estado por defecto**: Configurar `const [activeTab, setActiveTab] = useState<Tab>('inicio');` para que la app cargue en el `OnboardingView`.
3. **Ocultar Cabeceras de Pestaña**: La botonera inline (el div con `role="tablist"` que tiene los botones Buscar Familiar / Reportar) **sólo debe renderizarse si `activeTab === 'buscar'` o `activeTab === 'reportar'`**. Debe ocultarse si estamos en `'inicio'`.
4. **Renderizar Onboarding**:
   ```tsx
   {activeTab === 'inicio' && <OnboardingView onSelect={setActiveTab} />}
   ```
5. **Asegurar `MenuView`**: Validar que `MenuView.tsx` esté conectado y que su evento `onSelect` redirija correctamente las tabs e incluya al de `inicio`.

### Paso B: Integrar `SearchResultsList` en `src/views/search/SearchView.tsx`
1. **Remover el renderizado inline de la grilla**: Ubicar la sección donde `SearchView.tsx` itera sobre `pageItems.map` (alrededor de la línea 260) y eliminarla.
2. **Importar y Renderizar `SearchResultsList`**: 
   ```tsx
   import SearchResultsList from '../../components/search/SearchResultsList';
   // ...
   <SearchResultsList
     results={searchResults}
     page={page}
     pageSize={PAGE_SIZE}
     reportedIds={reportedIds}
     confirmingId={confirmingId}
     resultsError={error}
     onResetSearch={handleResetSearch}
     onOpenCandidate={(id) => {
       const person = searchResults.find(r => r.foundPerson.id === id);
       if (person) setSelectedCandidate(person.foundPerson);
     }}
     onConfirmReport={() => {}} // Adjust logic according to view needs
     onReportPublication={() => {}} // Adjust logic according to view needs
     onPageChange={setPage}
     onBack={() => {
        // Logica para cerrar busqueda (o llamar onBack prop de App)
     }}
   />
   ```
   **OJO**: Deberás mapear correctamente las variables de estado internas de `SearchView` (`confirmingId`, `reportedIds`) a las propiedades que espera `SearchResultsList`.

### Paso C: Validación
- Al terminar, ejecuta `npm run build` o `npm run lint` (`tsc --noEmit`) para garantizar que la conexión de variables, componentes e importaciones está 100% limpia sin conflictos de tipos.
