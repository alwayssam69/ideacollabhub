
import { Lightbulb, Loader2 } from "lucide-react";

export const Icons = {
  logo: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <Lightbulb className={className} {...props} />
  ),
  spinner: Loader2,
};
