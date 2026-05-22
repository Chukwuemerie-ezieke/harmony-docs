import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import MergeTool from "@/pages/tools/merge";
import SplitTool from "@/pages/tools/split";
import CompressTool from "@/pages/tools/compress";
import RotateTool from "@/pages/tools/rotate";
import PageNumbersTool from "@/pages/tools/page-numbers";
import ImgToPdfTool from "@/pages/tools/img-to-pdf";
import PdfToImgTool from "@/pages/tools/pdf-to-img";
import HtmlToPdfTool from "@/pages/tools/html-to-pdf";
import WatermarkTool from "@/pages/tools/watermark";
import AddTextTool from "@/pages/tools/add-text";
import ProtectTool from "@/pages/tools/protect";
import UnlockTool from "@/pages/tools/unlock";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/tool/merge" component={MergeTool} />
      <Route path="/tool/split" component={SplitTool} />
      <Route path="/tool/compress" component={CompressTool} />
      <Route path="/tool/rotate" component={RotateTool} />
      <Route path="/tool/page-numbers" component={PageNumbersTool} />
      <Route path="/tool/img-to-pdf" component={ImgToPdfTool} />
      <Route path="/tool/pdf-to-img" component={PdfToImgTool} />
      <Route path="/tool/html-to-pdf" component={HtmlToPdfTool} />
      <Route path="/tool/watermark" component={WatermarkTool} />
      <Route path="/tool/add-text" component={AddTextTool} />
      <Route path="/tool/protect" component={ProtectTool} />
      <Route path="/tool/unlock" component={UnlockTool} />
      <Route component={NotFound} />
    </Switch>
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
