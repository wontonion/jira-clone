import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex">
      <Button  size="lg">default</Button>
      <Button variant="secondary" size="lg">primary</Button>
      <Button variant="destructive" size="lg">primary</Button>
      <Button variant="muted" size="lg">primary</Button>
      {/* <Button variant="outline" size="lg">primary</Button> */}
      <Button variant="teritary" size="lg">primary</Button>
    </div>
  );
}
