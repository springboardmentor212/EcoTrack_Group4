import React, { useMemo, useState } from "react";
import {
  Car,
  Zap,
  Utensils,
  Droplets,
  Recycle,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Info,
  Leaf,
} from "lucide-react";

import "./CarbonFootprint.css";

const CATEGORY_DATA = {
  transportation: {
    title: "Transportation",
    icon: Car,
    color: "green",
    description:
      "Calculate emissions based on distance travelled and vehicle type.",
    factor: 0.192,
    unit: "kg CO₂e/km",
  },
  energy: {
    title: "Energy Consumption",
    icon: Zap,
    color: "yellow",
    description:
      "Estimate emissions from electricity and household energy consumption.",
    factor: 0.85,
    unit: "kg CO₂e/kWh",
  },
  food: {
    title: "Food",
    icon: Utensils,
    color: "orange",
    description:
      "Estimate the environmental impact of your food consumption.",
    factor: 0.5,
    unit: "kg CO₂e/meal",
  },
  water: {
    title: "Water Usage",
    icon: Droplets,
    color: "blue",
    description:
      "Estimate emissions associated with your water consumption.",
    factor: 0.001,
    unit: "kg CO₂e/L",
  },
  waste: {
    title: "Waste",
    icon: Recycle,
    color: "purple",
    description:
      "Estimate the environmental impact of household waste.",
    factor: 0.5,
    unit: "kg CO₂e/kg",
  },
};

const initialValues = {
  transportation: 45.5,
  energy: 14,
  food: 3,
  water: 120,
  waste: 2.5,
};

function getUnit(category) {
  switch (category) {
    case "transportation":
      return "km";
    case "energy":
      return "kWh";
    case "food":
      return "meals";
    case "water":
      return "L";
    case "waste":
      return "kg";
    default:
      return "";
  }
}

function CarbonFootprint() {
  const [activeCategory, setActiveCategory] = useState("transportation");
  const [values, setValues] = useState(initialValues);
  const [vehicle, setVehicle] = useState("Gasoline Car (Medium)");
  const [passengers, setPassengers] = useState(1);

  const currentCategory = CATEGORY_DATA[activeCategory];
  const Icon = currentCategory.icon;

  const currentEmission = useMemo(() => {
    const activity = Number(values[activeCategory]) || 0;
    let emission = activity * currentCategory.factor;

    if (activeCategory === "transportation" && passengers > 0) {
      emission = emission / Number(passengers);
    }

    return emission;
  }, [activeCategory, values, passengers, currentCategory]);

  const handleValueChange = (e) => {
    const value = e.target.value;
    setValues({
      ...values,
      [activeCategory]: value,
    });
  };

  const categoryEmissions = Object.entries(CATEGORY_DATA).map(
    ([key, category]) => {
      let emission = Number(values[key]) * category.factor;

      if (key === "transportation" && passengers > 0) {
        emission = emission / passengers;
      }

      return {
        key,
        name: category.title,
        emission,
      };
    }
  );

  const totalEmission = categoryEmissions.reduce(
    (sum, item) => sum + item.emission,
    0
  );

  return (
    <div className="carbon-page">
      <section className="carbon-header">
        <div>
          <div className="eyebrow">
            <Leaf size={16} />
            CARBON FOOTPRINT CALCULATION
          </div>
          <h1>How EcoTrack Calculates Your Carbon Footprint</h1>
          <p>
            Track your daily activities, apply configured emission factors, and
            understand your environmental impact in CO₂e.
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Carbon Calculation Flow</h2>
            <p>Your activity data is transformed into an estimated carbon footprint.</p>
          </div>
        </div>

        <div className="calculation-flow">
          <FlowStep number="01" title="Daily Activity" description="Log an activity" />
          <ArrowRight className="flow-arrow" />
          <FlowStep number="02" title="Activity Data" description="Quantity / Usage" />
          <ArrowRight className="flow-arrow" />
          <FlowStep number="03" title="Emission Factor" description="Configured factor" />
          <ArrowRight className="flow-arrow" />
          <FlowStep number="04" title="Calculation" description="Activity × Factor" />
          <ArrowRight className="flow-arrow" />
          <div className="flow-result">
            <span>CO₂e</span>
            <strong>{totalEmission.toFixed(1)}</strong>
            <small>kg CO₂e</small>
          </div>
        </div>
      </section>

      <section className="section-card formula-card">
        <div className="formula-icon">
          <Calculator size={24} />
        </div>
        <div className="formula-content">
          <div className="section-label">BASIC CARBON FOOTPRINT FORMULA</div>
          <h2>Activity Data × Emission Factor = Carbon Footprint</h2>
          <div className="formula-box">
            <span>45.5 km</span>
            <b>×</b>
            <span>0.192 kg CO₂e/km</span>
            <b>=</b>
            <strong>8.7 kg CO₂e</strong>
          </div>
          <p>
            EcoTrack multiplies the amount of an activity by the configured emission
            factor to estimate greenhouse-gas emissions.
          </p>
          <div className="info-note">
            <Info size={16} />
            <span>
              Example values shown on this page are illustrative. Actual emission factors
              are strictly synchronized with EcoTrack Engine.
            </span>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <div className="section-label">FIVE CALCULATION CATEGORIES</div>
            <h2>How Each Activity Is Calculated</h2>
            <p>Select a category to see its calculation method.</p>
          </div>
        </div>

        <div className="category-tabs">
          {Object.entries(CATEGORY_DATA).map(([key, category]) => {
            const CategoryIcon = category.icon;
            return (
              <button
                key={key}
                className={activeCategory === key ? "category-tab active" : "category-tab"}
                onClick={() => setActiveCategory(key)}
              >
                <CategoryIcon size={18} />
                <span>{category.title}</span>
              </button>
            );
          })}
        </div>

        <div className="category-calculator">
          <div className="calculator-left">
            <div className={`large-category-icon ${currentCategory.color}`}>
              <Icon size={28} />
            </div>
            <h3>{currentCategory.title}</h3>
            <p>{currentCategory.description}</p>

            {activeCategory === "transportation" && (
              <>
                <label>Vehicle Type</label>
                <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                  <option>Gasoline Car (Medium)</option>
                  <option>Diesel Car</option>
                  <option>Electric Car</option>
                  <option>Motorcycle</option>
                </select>

                <label>Distance Travelled</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={values.transportation}
                    onChange={handleValueChange}
                  />
                  <span>km</span>
                </div>

                <label>Number of Passengers</label>
                <input
                  type="number"
                  min="1"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))}
                />
              </>
            )}

            {activeCategory !== "transportation" && (
              <>
                <label>Activity Quantity</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    value={values[activeCategory]}
                    onChange={handleValueChange}
                  />
                  <span>{getUnit(activeCategory)}</span>
                </div>
              </>
            )}
          </div>

          <div className="calculator-right">
            <div className="calculation-mini">
              <span>ACTIVITY DATA</span>
              <strong>
                {Number(values[activeCategory]).toLocaleString()} {getUnit(activeCategory)}
              </strong>
            </div>

            <div className="calculation-symbol">×</div>

            <div className="calculation-mini">
              <span>EMISSION FACTOR</span>
              <strong>
                {currentCategory.factor} {currentCategory.unit}
              </strong>
            </div>

            <div className="calculation-symbol">=</div>

            <div className="calculation-result">
              <span>ESTIMATED CARBON EMISSION</span>
              <strong>{currentEmission.toFixed(1)}</strong>
              <small>kg CO₂e</small>
            </div>
          </div>
        </div>

        <div className="category-grid">
          {Object.entries(CATEGORY_DATA).map(([key, category]) => {
            const CategoryIcon = category.icon;
            const emission =
              categoryEmissions.find((item) => item.key === key)?.emission || 0;

            return (
              <div className="category-card" key={key}>
                <div className={`category-card-icon ${category.color}`}>
                  <CategoryIcon size={19} />
                </div>
                <div className="category-card-header">
                  <h3>{category.title}</h3>
                  <span>{emission.toFixed(1)} kg CO₂e</span>
                </div>
                <p>Activity quantity × configured emission factor</p>
                <div className="category-formula">
                  {Number(values[key]).toLocaleString()} × {category.factor} = {emission.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-card">
        <div className="section-label">STEP-BY-STEP EXAMPLE</div>
        <h2>See How One Activity Is Calculated</h2>
        <div className="step-example">
          <ExampleStep
            number="01"
            title="User enters activity"
            value="Gasoline Car · 45.5 km · 1 passenger"
          />
          <ArrowRight />
          <ExampleStep
            number="02"
            title="Emission factor identified"
            value="0.192 kg CO₂e / km"
          />
          <ArrowRight />
          <ExampleStep number="03" title="EcoTrack calculates" value="45.5 × 0.192" />
          <ArrowRight />
          <div className="final-example-result">
            <CheckCircle2 size={20} />
            <span>ESTIMATED FOOTPRINT</span>
            <strong>8.7 kg CO₂e</strong>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-label">EMISSION FACTORS</div>
        <h2>What Is an Emission Factor?</h2>
        <p className="section-description">
          An emission factor is a fixed value that represents the estimated amount of CO₂e
          produced per unit of a specific activity.
        </p>

        <div className="factor-grid">
          <Factor value="0.192 kg CO₂e / km" label="Gasoline Car" />
          <Factor value="0.053 kg CO₂e / km" label="Electric Vehicle" />
          <Factor value="0.089 kg CO₂e / km" label="Public Bus" />
          <Factor value="0.85 kg CO₂e / kWh" label="Electricity" />
          <Factor value="0.50 kg CO₂e / meal" label="Vegetarian Meal" />
          <Factor value="2.50 kg CO₂e / meal" label="Non-Vegetarian Meal" />
          <Factor value="0.001 kg CO₂e / litre" label="Tap Water" />
          <Factor value="0.50 kg CO₂e / kg" label="General Household Waste" />
        </div>

        <div className="factor-note">
          <Info size={18} />
          <span>
            These emission factors are fixed values configured in the EcoTrack backend.
          </span>
        </div>
      </section>

      <footer className="ecotrack-footer">
        <div className="footer-brand">
          <strong>EcoTrack</strong>
          <p>AI-Powered Carbon Footprint & Sustainability Management Platform</p>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EcoTrack. All rights reserved.</span>
          <span>Mathematical demonstrations are for educational illustration.</span>
        </div>
      </footer>
    </div>
  );
}

function FlowStep({ number, title, description }) {
  return (
    <div className="flow-step">
      <span>{number}</span>
      <strong>{title}</strong>
      <small>{description}</small>
    </div>
  );
}

function ExampleStep({ number, title, value }) {
  return (
    <div className="example-step">
      <span>{number}</span>
      <strong>{title}</strong>
      <small>{value}</small>
    </div>
  );
}

function Factor({ value, label }) {
  return (
    <div className="factor-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default CarbonFootprint;