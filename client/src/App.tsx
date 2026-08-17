import { lazy, Suspense } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";

const MergeTool = lazy(() => import("@/pages/tools/merge"));
const SplitTool = lazy(() => import("@/pages/tools/split"));
const CompressTool = lazy(() => import("@/pages/tools/compress"));
const RotateTool = lazy(() => import("@/pages/tools/rotate"));
const PageNumbersTool = lazy(() => import("@/pages/tools/page-numbers"));
const ImgToPdfTool = lazy(() => import("@/pages/tools/img-to-pdf"));
const PdfToImgTool = lazy(() => import("@/pages/tools/pdf-to-img"));
const PdfToImagesTool = lazy(() => import("@/pages/tools/pdf-to-images-release2"));
const HtmlToPdfTool = lazy(() => import("@/pages/tools/html-to-pdf-browser"));
const WatermarkTool = lazy(() => import("@/pages/tools/watermark"));
const AddTextTool = lazy(() => import("@/pages/tools/add-text"));
const ProtectTool = lazy(() => import("@/pages/tools/protect"));
const UnlockTool = lazy(() => import("@/pages/tools/unlock"));
const RearrangeTool = lazy(() => import("@/pages/tools/rearrange"));
const OrganizeTool = lazy(() => import("@/pages/tools/organize"));
const ExtractTool = lazy(() => import("@/pages/tools/extract"));
const DeleteTool = lazy(() => import("@/pages/tools/delete-pages"));
const SignPdfTool = lazy(() => import("@/pages/tools/sign-pdf"));
const CompressImageTool = lazy(() => import("@/pages/tools/compress-image"));
const ResizeImageTool = lazy(() => import("@/pages/tools/resize-image"));
const CropImageTool = lazy(() => import("@/pages/tools/crop-image"));
const RotateImageTool = lazy(() => import("@/pages/tools/rotate-image"));
const WatermarkImageTool = lazy(() => import("@/pages/tools/watermark-image"));

function LoadingFallback() {
  return (
    <Layout>
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading tool...</p>
      </div>
    </Layout>
  );
}

function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/tool/merge" component={MergeTool} />
        <Route path="/tool/split" component={SplitTool} />
        <Route path="/tool/compress" component={CompressTool} />
        <Route path="/tool/rotate" component={RotateTool} />
        <Route path="/tool/page-numbers" component={PageNumbersTool} />
        <Route path="/tool/img-to-pdf" component={ImgToPdfTool} />
        <Route path="/tool/pdf-to-img" component={PdfToImgTool} />
        <Route path="/tool/pdf-to-images" component={PdfToImagesTool} />
        <Route path="/tool/html-to-pdf" component={HtmlToPdfTool} />
        <Route path="/tool/watermark" component={WatermarkTool} />
        <Route path="/tool/add-text" component={AddTextTool} />
        <Route path="/tool/protect" component={ProtectTool} />
        <Route path="/tool/unlock" component={UnlockTool} />
        <Route path="/tool/rearrange" component={RearrangeTool} />
        <Route path="/tool/organize" component={OrganizeTool} />
        <Route path="/tool/extract" component={ExtractTool} />
        <Route path="/tool/delete" component={DeleteTool} />
        <Route path="/tool/sign-pdf" component={SignPdfTool} />
        <Route path="/tool/compress-image" component={CompressImageTool} />
        <Route path="/tool/resize-image" component={ResizeImageTool} />
        <Route path="/tool/crop-image" component={CropImageTool} />
        <Route path="/tool/rotate-image" component={RotateImageTool} />
        <Route path="/tool/watermark-image" component={WatermarkImageTool} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
