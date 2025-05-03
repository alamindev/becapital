import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input
import { Label } from "@/components/ui/label"; // Assuming shadcn/ui Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming shadcn/ui Select
import React, { useMemo, useState } from "react";
import MetricCard from "./MetricCard"; // Re-use MetricCard for displaying results

// Re-use PropertyData interface
interface PropertyData {
  id: number;
  commune: string;
  adresse: string;
  type: string;
  anneconstr: string;
  prixacquisitionchf: number | null;
  financementchf: number | null;
  financement: number | null;
  valeurcbrechf: number | null;
  loyerannuelsourcechf: number | null;
  loyerfutursourcechf: number | null;
  rendbrutsource: number | null;
  constructionrnovation: string | null;
  surfacelocm: number | null;
  vacance: number | null;
  loyeractuelchfancbre: number | null;
  loyerpotentielchfancbre: number | null;
  potentiel: number | null;
  rendbrut: string | null;
  rendnet: string | null;
  toiture: string | null;
  fentres: string | null;
  chauffagetypeanne: string | null;
  faade: string | null;
  notes: string | null;
  datevaluation: string | null;
  tauxdescomptenominal: number | null;
  tauxcapitalisationexit: number | null;
  inflation: number | null;
}

interface SimulationSectionProps {
  properties: PropertyData[];
  originalTotalValue: number;
}

// Basic DCF-like valuation (simplified example)
// This is a placeholder and should be replaced with the actual valuation logic if available
const calculateSimulatedValue = (
  property: PropertyData,
  rentalGrowth: number, // as percentage, e.g., 2 for 2%
  exitCapRate: number // as percentage, e.g., 4 for 4%
): number | null => {
  const currentRent = property.loyeractuelchfancbre;

  if (currentRent === null || currentRent === undefined)
    return property.valeurcbrechf; // Return original if no rent
  if (exitCapRate <= 0) return 0; // Avoid division by zero

  const futureRent = currentRent * (1 + rentalGrowth / 100);
  const simulatedValue = futureRent / (exitCapRate / 100);

  return isNaN(simulatedValue) ? property.valeurcbrechf : simulatedValue;
};

const SimulationSection: React.FC<SimulationSectionProps> = ({
  properties,
  originalTotalValue,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(""); // Default to empty string
  const [rentalGrowth, setRentalGrowth] = useState<string>("2"); // Default 2%
  const [exitCapRate, setExitCapRate] = useState<string>("4"); // Default 4%

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id.toString() === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  const simulatedValue = useMemo(() => {
    if (!selectedProperty) return null;
    const growth = parseFloat(rentalGrowth);
    const capRate = parseFloat(exitCapRate);
    if (isNaN(growth) || isNaN(capRate)) return selectedProperty.valeurcbrechf; // Return original if inputs invalid

    return calculateSimulatedValue(selectedProperty, growth, capRate);
  }, [selectedProperty, rentalGrowth, exitCapRate]);

  const valueDifference = useMemo(() => {
    if (
      simulatedValue === null ||
      !selectedProperty ||
      selectedProperty.valeurcbrechf === null
    )
      return 0;
    return simulatedValue - selectedProperty.valeurcbrechf;
  }, [simulatedValue, selectedProperty]);

  const newTotalValue = useMemo(() => {
    return originalTotalValue + valueDifference;
  }, [originalTotalValue, valueDifference]);

  return (
    <section className="bg-white rounded-lg shadow-md p-4 mb-8">
      <h2 className="text-xl font-semibold text-be_capital_dark_grey mb-4">
        Valuation Simulation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Property Selection */}
        <div>
          <Label htmlFor="sim-property">Select Property</Label>
          <Select
            value={selectedPropertyId}
            onValueChange={setSelectedPropertyId}
          >
            <SelectTrigger id="sim-property">
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {properties.map((prop) => (
                <SelectItem key={prop.id} value={prop.id.toString()}>
                  {prop.adresse} ({prop.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rental Growth Input */}
        <div>
          <Label htmlFor="sim-growth">Rental Growth (%)</Label>
          <Input
            id="sim-growth"
            type="number"
            value={rentalGrowth}
            onChange={(e) => setRentalGrowth(e.target.value)}
            placeholder="e.g., 2"
            step="0.1"
          />
        </div>

        {/* Exit Cap Rate Input */}
        <div>
          <Label htmlFor="sim-caprate">Exit Cap Rate (%)</Label>
          <Input
            id="sim-caprate"
            type="number"
            value={exitCapRate}
            onChange={(e) => setExitCapRate(e.target.value)}
            placeholder="e.g., 4"
            step="0.1"
          />
        </div>
      </div>

      {/* Simulation Results */}
      {selectedProperty && (
        <div>
          <h3 className="text-lg font-medium text-be_capital_dark_grey mb-4">
            Simulation Results for: {selectedProperty.adresse}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Original Value (CBRE)"
              value={
                selectedProperty.valeurcbrechf?.toLocaleString("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                  minimumFractionDigits: 0,
                }) ?? "-"
              }
              borderColor="border-gray-400"
              textColor="text-gray-600"
            />
            <MetricCard
              title="Simulated Value"
              value={
                simulatedValue?.toLocaleString("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                  minimumFractionDigits: 0,
                }) ?? "-"
              }
            />
            <MetricCard
              title="Value Change"
              value={
                valueDifference.toLocaleString("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                  minimumFractionDigits: 0,
                }) ?? "-"
              }
              textColor={
                valueDifference >= 0 ? "text-green-600" : "text-red-600"
              }
              borderColor={
                valueDifference >= 0 ? "border-green-500" : "border-red-500"
              }
            />
            <MetricCard
              title="Original Total Portfolio Value"
              value={
                originalTotalValue.toLocaleString("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                  minimumFractionDigits: 0,
                }) ?? "-"
              }
              borderColor="border-gray-400"
              textColor="text-gray-600"
            />
            <MetricCard
              title="New Total Portfolio Value"
              value={
                newTotalValue.toLocaleString("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                  minimumFractionDigits: 0,
                }) ?? "-"
              }
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default SimulationSection;
