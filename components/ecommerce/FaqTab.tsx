// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Trash2, Plus, HelpCircle, ThumbsUp, UserCheck } from "lucide-react";

// interface Faq {
//   question: string;
//   answer: string;
//   certifiedBuyer: boolean;
//   isLike: boolean;
// }

// interface FaqTabProps {
//   faq: Faq[];
//   addFaq: () => void;
//   removeFaq: (index: number) => void;
//   updateFaq: (index: number, field: string, value: any) => void;
// }

// export const FaqTab: React.FC<FaqTabProps> = ({
//   faq,
//   addFaq,
//   removeFaq,
//   updateFaq,
// }) => {
//   const ToggleButton = ({
//     checked,
//     onCheckedChange,
//     label,
//     icon: Icon,
//     description
//   }: {
//     checked: boolean;
//     onCheckedChange: (checked: boolean) => void;
//     label: string;
//     icon: React.ComponentType<any>;
//     description?: string;
//   }) => (
//     <div className="group">
//       <div
//         className={`relative flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
//           checked
//             ? 'border-purple-500 bg-purple-50 shadow-md'
//             : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
//         }`}
//         onClick={() => onCheckedChange(!checked)}
//       >
//         <div className="flex items-center space-x-3">
//           <div className={`p-2 rounded-full transition-colors duration-300 ${
//             checked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
//           }`}>
//             <Icon size={18} />
//           </div>
//           <div>
//             <Label className={`text-sm font-medium cursor-pointer ${
//               checked ? 'text-purple-900' : 'text-gray-700'
//             }`}>
//               {label}
//             </Label>
//             {description && (
//               <p className={`text-xs mt-1 ${
//                 checked ? 'text-purple-600' : 'text-gray-500'
//               }`}>
//                 {description}
//               </p>
//             )}
//           </div>
//         </div>
//         <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
//           checked ? 'bg-purple-600' : 'bg-gray-200'
//         }`}>
//           <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
//             checked ? 'translate-x-6' : 'translate-x-1'
//           }`} />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-4">
//       <Label className="text-lg font-semibold flex items-center space-x-2">
//         <HelpCircle size={20} />
//         <span>Product FAQ</span>
//       </Label>
//       {faq.map((faqItem, index) => (
//         <div
//           key={index}
//           className="border rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow"
//         >
//           <div className="flex items-center justify-between">
//             <h4 className="font-medium">FAQ {index + 1}</h4>
//             {faq.length > 1 && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={() => removeFaq(index)}
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//           <div className="space-y-4">
//             <div>
//               <Label>Question</Label>
//               <Input
//                 value={faqItem.question}
//                 onChange={(e) =>
//                   updateFaq(index, "question", e.target.value)
//                 }
//                 placeholder="Enter FAQ question"
//               />
//             </div>
//             <div>
//               <Label>Answer</Label>
//               <Textarea
//                 value={faqItem.answer}
//                 onChange={(e) =>
//                   updateFaq(index, "answer", e.target.value)
//                 }
//                 placeholder="Enter FAQ answer"
//                 rows={3}
//               />
//             </div>
//             <div className="flex items-center space-x-4">
//               <ToggleButton
//                 checked={faqItem.certifiedBuyer}
//                 onCheckedChange={(checked) =>
//                   updateFaq(index, "certifiedBuyer", checked)
//                 }
//                 label="Certified Buyer"
//                 icon={UserCheck}
//               />
//               <ToggleButton
//                 checked={faqItem.isLike}
//                 onCheckedChange={(checked) =>
//                   updateFaq(index, "isLike", checked)
//                 }
//                 label="Liked"
//                 icon={ThumbsUp}
//               />
//             </div>
//           </div>
//         </div>
//       ))}
//       <Button type="button" variant="outline" className="flex items-center" onClick={addFaq}>
//         <Plus className="h-4 w-4 mr-2" />
//         Add FAQ
//       </Button>
//     </div>
//   );
// };
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, HelpCircle, ThumbsUp, UserCheck } from "lucide-react";

interface Faq {
  question: string;
  answer: string;
  certifiedBuyer: boolean;
  isLike: boolean;
}

interface FaqTabProps {
  faq: Faq[];
  addFaq: () => void;
  removeFaq: (index: number) => void;
  updateFaq: (index: number, field: string, value: any) => void;
}

export const FaqTab: React.FC<FaqTabProps> = ({
  faq,
  addFaq,
  removeFaq,
  updateFaq,
}) => {
  const ToggleButton = ({
    checked,
    onCheckedChange,
    label,
    icon: Icon,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    icon: React.ComponentType<any>;
  }) => (
    <div
      className={`flex items-center space-x-2 cursor-pointer select-none ${
        checked ? "text-blue-600" : "text-gray-500"
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <Icon size={18} />
      <Label className="cursor-pointer">{label}</Label>
    </div>
  );

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold flex items-center space-x-2">
        <HelpCircle size={20} />
        <span>Product FAQ</span>
      </Label>
      {faq.map((faqItem, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">FAQ {index + 1}</h4>
            {faq.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFaq(index)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={faqItem.question}
                onChange={(e) =>
                  updateFaq(index, "question", e.target.value)
                }
                placeholder="Enter FAQ question"
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={faqItem.answer}
                onChange={(e) =>
                  updateFaq(index, "answer", e.target.value)
                }
                placeholder="Enter FAQ answer"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-4">
              <ToggleButton
                checked={faqItem.certifiedBuyer}
                onCheckedChange={(checked) =>
                  updateFaq(index, "certifiedBuyer", checked)
                }
                label="Certified Buyer"
                icon={UserCheck}
              />
              <ToggleButton
                checked={faqItem.isLike}
                onCheckedChange={(checked) =>
                  updateFaq(index, "isLike", checked)
                }
                label="Liked"
                icon={ThumbsUp}
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" className="flex items-center" onClick={addFaq}>
        <Plus className="h-4 w-4 mr-2" />
        Add FAQ
      </Button>
    </div>
  );
};
