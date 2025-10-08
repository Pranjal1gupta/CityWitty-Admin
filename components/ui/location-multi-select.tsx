"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Comprehensive list of common locations
const COMMON_LOCATIONS = [
  "Abohar",
  "Adilabad",
  "Agartala",
  "Agra",
  "Ahmedabad",
  "Ahmednagar",
  "Greater Noida",
  "Greater Noida West",
  "Aizawl",
  "Ajmer",
  "Akola",
  "Alappuzha",
  "Aligarh",
  "Alwar",
  "Ambala",
  "Amravati",
  "Amritsar",
  "Anantapur",
  "Arrah",
  "Asansol",
  "Aurangabad",
  "Azamgarh",
  "Bagalkot",
  "Bageshwar",
  "Bahraich",
  "Balaghat",
  "Baleshwar",
  "Ballia",
  "Balrampur",
  "Banaskantha",
  "Banda",
  "Bangarapet",
  "Bangalore",
  "Bankura",
  "Banswara",
  "Barabanki",
  "Baramati",
  "Baran",
  "Barasat",
  "Bardhaman",
  "Bareilly",
  "Bargarh",
  "Baripada",
  "Barmer",
  "Barnala",
  "Bastar",
  "Basti",
  "Bathinda",
  "Beed",
  "Begusarai",
  "Belagavi",
  "Bellary",
  "Betul",
  "Bhadrak",
  "Bhagalpur",
  "Bhandara",
  "Bharatpur",
  "Bharuch",
  "Bhatapara",
  "Bhavnagar",
  "Bhilai",
  "Bhilwara",
  "Bhimavaram",
  "Bhiwani",
  "Varanasi",
  "Prayagraj (Allahabad)",
  "Patna",
  "Bhopal",
  "Bidar",
  "Pune",
  "Bijapur",
  "Bikaner",
  "Bilaspur",
  "Bokaro",
  "Bulandshahr",
  "Burhanpur",
  "Buxar",
  "Cachar",
  "Chandauli",
  "Chandel",
  "Chandigarh",
  "Chandrapur",
  "Charkhi Dadri",
  "Chatra",
  "Chennai",
  "Chhatarpur",
  "Chhindwara",
  "Chikkamagaluru",
  "Chittoor",
  "Chitradurga",
  "Chittorgarh",
  "Churachandpur",
  "Coimbatore",
  "Cooch Behar",
  "Cuddalore",
  "Cuttack",
  "Dadra and Nagar Haveli",
  "Dahod",
  "Dakshina Kannada",
  "Daman",
  "Damoh",
  "Darbhanga",
  "Darjeeling",
  "Datia",
  "Dausa",
  "Davangere",
  "Dehradun",
  "Delhi",
  "Deoria",
  "Dhamtari",
  "Dhanbad",
  "Dhar",
  "Dharmapuri",
  "Dharwad",
  "Dhule",
  "Dibang Valley",
  "Dibrugarh",
  "Dindigul",
  "Dindori",
  "Diu",
  "Doda",
  "Dumka",
  "Durg",
  "Durgapur",
  "East Godavari",
  "East Khasi Hills",
  "East Siang",
  "East Sikkim",
  "East Singhbhum",
  "Ernakulam",
  "Etah",
  "Etawah",
  "Erode",
  "Faridabad",
  "Faridkot",
  "Farrukhabad",
  "Fatehgarh Sahib",
  "Fatehpur",
  "Fazilka",
  "Firozabad",
  "Firozpur",
  "Gadag",
  "Gadchiroli",
  "Gajapati",
  "Ganderbal",
  "Ganganagar",
  "Ganjam",
  "Garhwa",
  "Gautam Buddha Nagar",
  "Gaya",
  "Ghaziabad",
  "Ghazipur",
  "Giridih",
  "Goalpara",
  "Godda",
  "Gokak",
  "Gonda",
  "Gopalganj",
  "Gorakhpur",
  "Gulbarga",
  "Gumla",
  "Guna",
  "Guntur",
  "Gurdaspur",
  "Gurgaon",
  "Guwahati",
  "Gwalior",
  "Hailakandi",
  "Hamirpur",
  "Hanumangarh",
  "Harda",
  "Haridwar",
  "Hassan",
  "Haveri",
  "Hazaribagh",
  "Hingoli",
  "Hissar",
  "Hooghly",
  "Hoshangabad",
  "Hoshiarpur",
  "Howrah",
  "Hyderabad",
"Idukki",
  "Imphal",
  "Indore",
  "Jabalpur",
  "Jagatsinghpur",
  "Jaintia Hills",
  "Jaipur",
  "Jaisalmer",
  "Jajpur",
  "Jalandhar",
  "Jalaun",
  "Jalgaon",
  "Jalna",
  "Jalore",
  "Jalpaiguri",
  "Jammu",
  "Jamui",
  "Janjgir-Champa",
  "Jashpur",
  "Jaunpur",
  "Jhabua",
  "Jhajjar",
  "Jhalawar",
  "Jhansi",
  "Jharsuguda",
  "Jhunjhunu",
  "Jind",
  "Jodhpur",
  "Jorhat",
  "Junagadh",
  "Junglemahal",
  "Kadapa",
  "Kailari",
  "Kaithal",
  "Kakinada",
  "Kalaburagi",
  "Kalahandi",
  "Kallakurichi",
  "Kalyan",
  "Kanchipuram",
  "Kandhamal",
  "Kanker",
  "Kannauj",
  "Kannur",
  "Kanpur",
  "Kanshi Ram Nagar",
  "Kapurthala",
  "Karaikal",
  "Karauli",
  "Karbi Anglong",
  "Kargil",
  "Karimganj",
  "Karimnagar",
  "Karnal",
  "Karur",
  "Kasaragod",
  "Katihar",
  "Katni",
  "Kaushambi",
  "Kendrapara",
  "Kendujhar",
  "Khagaria",
  "Khammam",
  "Khandwa",
  "Khargone",
  "Kheda",
  "Kheralu",
  "Khordha",
  "Khowai",
  "Khunti",
  "Kinnaur",
  "Kishanganj",
  "Kishtwar",
  "Kodagu",
  "Koderma",
  "Kohima",
  "Kokrajhar",
  "Kolar",
  "Kolkata",
  "Kollam",
  "Koppal",
  "Koraput",
  "Korba",
  "Kota",
  "Kothagudem",
  "Kottayam",
  "Krishna",
  "Kulgam",
  "Kullu",
  "Kupwara",
  "Kurukshetra",
  "Noida",
  "Kurnool",
  "Kurung Kumey",
  "Kushinagar",
  "Kutch",
  "Lakhimpur",
  "Lakhisarai",
  "Lalitpur",
  "Latur",
  "Lawngtlai",
  "Leh",
  "Lohardaga",
  "Lohit",
  "Lucknow",
  "Ludhiana",
  "Lunglei",
  "Madhepura",
  "Madhubani",
  "Madhya Pradesh",
  "Madurai",
  "Mahamaya Nagar",
  "Mahasamund",
  "Mahbubnagar",
  "Mahe",
  "Mahendragarh",
  "Mahoba",
  "Mainpuri",
  "Malappuram",
  "Malkangiri",
  "Mamit",
  "Mandi",
  "Mandla",
  "Mandsaur",
  "Mandya",
  "Mango",
  "Mansa",
  "Marigaon",
  "Mathura",
  "Mau",
  "Mayurbhanj",
  "Medak",
  "Meerut",
  "Meghalaya",
  "Mewat",
  "Mirzapur",
  "Moga",
  "Mohali",
  "Mokokchung",
  "Mon",
  "Moradabad",
  "Morena",
  "Mumbai",
  "Munger",
  "Murshidabad",
  "Muzaffarpur",
  "Mysore",
  "Nabarangpur",
  "Nadia",
  "Nagaon",
  "Nagapattinam",
  "Nagaur",
  "Nagpur",
  "Nainital",
  "Nalanda",
  "Nalbari",
  "Namakkal",
  "Nanded",
  "Nandurbar",
  "Nandivelugu",
  "Narayanpur",
  "Narmada",
  "Narsinghpur",
  "Nashik",
  "Navsari",
  "Nawada",
  "Nawanshahr",
  "Nayagarh",
  "Neemuch",
  "Nellore",
  "New Delhi",
  "Nilgiris",
  "North 24 Parganas",
  "North Delhi",
  "North East Delhi",
  "North Goa",
  "North Sikkim",
  "North Tripura",
  "Nuapada",
  "Ongole",
  "Osmanabad",
  "Pali",
  "Palakkad",
  "Palamu",
  "Panchkula",
  "Panchmahal",
  "Panipat",
  "Panna",
  "Papum Pare",
  "Parbhani",
  "Paschim Medinipur",
  "Patan",
  "Pathanamthitta",
  "Pathankot",
  "Patiala",
  "Pithoragarh",
  "Pondicherry",
  "Poonch",
  "Porbandar",
  "Pratapgarh",
  "Purba Medinipur",
  "Puri",
  "Purnia",
  "Purwa",
  "Qadian",
  "Raebareli",
  "Raichur",
  "Raigad",
  "Raigarh",
  "Raipur",
  "Rajauri",
  "Rajgarh",
  "Rajkot",
  "Rajnandgaon",
  "Rajsamand",
  "Ramanagaram",
  "Ramanathapuram",
  "Ramban",
  "Ramgarh",
  "Rampur",
  "Ranchi",
  "Ratlam",
  "Ratnagiri",
  "Rayagada",
  "Reasi",
  "Rewa",
  "Rishikesh",
  "Rohtak",
  "Roorkee",
  "Rupnagar",
  "Sagar",
  "Saharanpur",
  "Saharsa",
  "Salem",
  "Samastipur",
  "Samba",
  "Sambalpur",
  "Sangli",
  "Sangrur",
  "Sant Kabir Nagar",
  "Saran",
  "Satara",
  "Satna",
  "Sawai Madhopur",
  "Sehore",
  "Senapati",
  "Seoni",
  "Serchhip",
  "Shahdol",
  "Shahjahanpur",
  "Shajapur",
  "Sheikhpura",
  "Sheohar",
  "Shimla",
  "Shimoga",
  "Shivpuri",
  "Siddharthnagar",
  "Sidhi",
  "Sikar",
  "Simdega",
  "Sindhudurg",
  "Singrauli",
  "Sirmaur",
  "Sirohi",
  "Sitamarhi",
  "Sitapur",
  "Sivaganga",
  "Sivakasi",
  "Siwan",
  "Solan",
  "Solapur",
  "Sonipat",
  "South 24 Parganas",
  "South Delhi",
  "South Goa",
  "South Sikkim",
  "South Tripura",
  "Srikakulam",
  "Srinagar",
  "Sultanpur",
  "Sundergarh",
  "Surat",
  "Surendranagar",
  "Suryapet",
  "Susangerd",
  "Tarn Taran",
  "Tawang",
  "Tehri Garhwal",
  "Thane",
  "Thanjavur",
  "Theni",
  "Thiruvananthapuram",
  "Thoothukudi",
  "Thrissur",
  "Tikamgarh",
  "Tinsukia",
  "Tirunelveli",
  "Tirupati",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Tonk",
  "Tuensang",
  "Udaipur",
  "Udalguri",
  "Gurugram",
  "Udhampur",
  "Udupi",
  "Ujjain",
  "Umaria",
  "Una",
  "Unnao",
  "Upper Siang",
  "Upper Subansiri",
  "Uttar Dinajpur",
  "Uttara Kannada",
  "Vadodara",
  "Vellore",
  "Vidisha",
  "Viluppuram",
  "Virudhunagar",
  "Visakhapatnam",
  "Vizianagaram",
  "Wayanad",
  "West Champaran",
  "West Delhi",
  "West Garo Hills",
  "West Jaintia Hills",
  "West Kameng",
  "West Khasi Hills",
  "West Midnapore",
  "West Siang",
  "West Sikkim",
  "West Singhbhum",
  "West Tripura",
  "Yadgir",
  "Yamunanagar",
  "Yanam",
  "Yavatmal",
  "Zunheboto"
];

interface LocationMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function LocationMultiSelect({
  value = [],
  onChange,
  placeholder = "Select locations...",
  className,
}: LocationMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = React.useCallback((location: string) => {
    if (value.includes(location)) {
      onChange?.(value.filter((item) => item !== location));
    } else {
      onChange?.([...value, location]);
    }
    setInputValue("");
  }, [value, onChange]);

  const handleRemove = React.useCallback((location: string) => {
    onChange?.(value.filter((item) => item !== location));
  }, [value, onChange]);

  const handleInputKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleSelect(inputValue.trim());
    }
  }, [inputValue, handleSelect]);

  // Filter locations based on input
  const filteredLocations = React.useMemo(() => {
    if (!inputValue) return COMMON_LOCATIONS;
    return COMMON_LOCATIONS.filter((location) =>
      location.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue]);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length === 0 ? (
              placeholder
            ) : (
              <span className="truncate">
                {value.length} location{value.length > 1 ? "s" : ""} selected
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search locations..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                {inputValue.trim() ? (
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelect(inputValue.trim())}
                      className="w-full justify-start"
                    >
                      Add "{inputValue.trim()}"
                    </Button>
                  </div>
                ) : (
                  "No locations found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {!inputValue && (
                  <CommandItem
                    key="all-india"
                    value="All India"
                    onSelect={() => {
                      onChange?.(COMMON_LOCATIONS);
                      setOpen(false);
                    }}
                  >
                    All India
                  </CommandItem>
                )}
                {filteredLocations.map((location) => (
                  <CommandItem
                    key={location}
                    value={location}
                    onSelect={() => handleSelect(location)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(location) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.slice(0, 10).map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300 pr-1"
              onClick={() => handleRemove(location)}
            >
              {location}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {value.length > 10 && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300 pr-1"
              onClick={() => setOpen(true)}
            >
              Show more...
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
