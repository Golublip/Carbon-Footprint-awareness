import type { LogEntry, UserProfile } from '../models/types';

export const aiCoachService = {
  /**
   * Generates a personalized coaching message based on user logs and profile.
   */
  async generateCoaching(
    userMessage: string,
    history: LogEntry[],
    profile: UserProfile
  ): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Calculate averages and top category
    const averages = this.getCategoryAverages(history);
    const topCategory = this.getTopEmissionCategory(averages);
    const totalAvg = Object.values(averages).reduce((a, b) => a + b, 0);

    // If API Key is present, make real call to Gemini
    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      try {
        const response = await this.callGeminiAPI(apiKey, userMessage, averages, topCategory, totalAvg, profile);
        if (response) return response;
      } catch (e) {
        console.error('Gemini API call failed, falling back to local coach heuristics', e);
      }
    }

    // Heuristic Local Coach Fallback
    return this.getLocalCoachHeuristics(userMessage, averages, topCategory, totalAvg, profile);
  },

  getCategoryAverages(history: LogEntry[]): { [key: string]: number } {
    if (history.length === 0) return { transportation: 0, electricity: 0, water: 0, food: 0, shopping: 0 };
    
    const sums = { transportation: 0, electricity: 0, water: 0, food: 0, shopping: 0 };
    history.forEach(log => {
      sums.transportation += log.emissions.transportation;
      sums.electricity += log.emissions.electricity;
      sums.water += log.emissions.water;
      sums.food += log.emissions.food;
      sums.shopping += log.emissions.shopping;
    });

    const count = history.length;
    return {
      transportation: parseFloat((sums.transportation / count).toFixed(2)),
      electricity: parseFloat((sums.electricity / count).toFixed(2)),
      water: parseFloat((sums.water / count).toFixed(2)),
      food: parseFloat((sums.food / count).toFixed(2)),
      shopping: parseFloat((sums.shopping / count).toFixed(2)),
    };
  },

  getTopEmissionCategory(averages: { [key: string]: number }): { category: string; value: number } {
    let topCat = 'transportation';
    let maxVal = 0;

    Object.entries(averages).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });

    return { category: topCat, value: maxVal };
  },

  async callGeminiAPI(
    apiKey: string,
    userMessage: string,
    averages: { [key: string]: number },
    topCategory: { category: string; value: number },
    totalAvg: number,
    profile: UserProfile
  ): Promise<string | null> {
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contextPrompt = `
You are EcoCoach, an expert AI sustainability coach. You are helping ${profile.name} reduce their carbon footprint.
Here is the user's carbon footprint profile (averages from their logged logs):
- Daily Average Carbon Footprint: ${totalAvg.toFixed(2)} kg CO2e
- Daily Carbon Target/Goal: ${profile.dailyGoalKg} kg CO2e
- Category Averages (kg CO2e/day):
  * Transportation: ${averages.transportation}
  * Electricity: ${averages.electricity}
  * Water: ${averages.water}
  * Food Habits: ${averages.food}
  * Shopping Habits: ${averages.shopping}
- Highest Emission Contributor: ${topCategory.category} (${topCategory.value.toFixed(2)} kg CO2e/day)

Be encouraging, concise, actionable, and focus on practical steps. Provide specific figures if asked. Keep formatting clean and use bullet points for lists.

User's message: "${userMessage}"
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextPrompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  },

  getLocalCoachHeuristics(
    userMessage: string,
    averages: { [key: string]: number },
    topCategory: { category: string; value: number },
    totalAvg: number,
    profile: UserProfile
  ): string {
    const msg = userMessage.toLowerCase();
    
    // Help command
    if (msg.includes('help') || msg.includes('what can you do')) {
      return `Hello! I am your AI Sustainability Coach. I analyze your carbon habits and provide customized advice. You can ask me:
- **"What is my biggest emitter?"** to understand where your emissions come from.
- **"How can I save carbon?"** or **"How to reduce food footprint?"** to get practical action lists.
- **"Forecast my footprint"** to see your potential savings.
- Or simply chat with me about sustainable living choices!`;
    }

    // Identify biggest emitter
    if (msg.includes('biggest') || msg.includes('emitter') || msg.includes('contributor') || msg.includes('highest')) {
      const pct = totalAvg > 0 ? Math.round((topCategory.value / totalAvg) * 100) : 0;
      let advice = '';
      if (topCategory.category === 'transportation') {
        advice = 'Since commuting is your main source, try replacing short car trips with walking or cycling, or use public transit for work commutes.';
      } else if (topCategory.category === 'electricity') {
        advice = 'Since home electricity is high, unplug idle chargers (phantom load), switch to LED bulbs, and look into green utility energy options.';
      } else if (topCategory.category === 'food') {
        advice = 'Since food habits are your top contributor, committing to a "Meatless Monday" or switching beef meals to chicken or vegetarian dishes will yield massive savings.';
      } else if (topCategory.category === 'water') {
        advice = 'Since water usage is significant, aim for shorter showers (under 5 minutes) and install low-flow aerators on sinks.';
      } else {
        advice = 'Since shopping/packaging represents a high load, focus on reducing clothing/electronics purchases, buying secondhand, and increasing your recycling rate.';
      }

      return `Your highest daily carbon contributor is **${topCategory.category.toUpperCase()}**, emitting an average of **${topCategory.value.toFixed(1)} kg CO2e/day** (about **${pct}%** of your total **${totalAvg.toFixed(1)} kg CO2e/day** average). 

${advice}
      
Would you like some specific action recommendations for this category?`;
    }

    // General reduction or tips
    if (msg.includes('reduce') || msg.includes('save') || msg.includes('action') || msg.includes('tips') || msg.includes('recommendation')) {
      if (msg.includes('food') || topCategory.category === 'food' && !msg.includes('transport') && !msg.includes('electricity')) {
        return `Here are realistic steps to reduce your **Food & Diet** footprint:
1. **Substitute Beef/Lamb**: Beef produces ~30x more emissions than chicken and ~60x more than grains. Even shifting to chicken/fish or eggs makes a major difference.
2. **Commit to Plant-Based Days**: Replacing 2 meals a week with plant-based alternatives (tofu, beans, lentils) saves ~150 kg CO2e per year.
3. **Control Food Waste**: Plan meals in advance. Food rotting in landfills releases methane, which is 25x more potent than CO2. Compost organic leftovers.
4. **Choose Local & Seasonal**: Reduces transit emissions (food miles) and packaging intensity.`;
      }

      if (msg.includes('transport') || msg.includes('car') || msg.includes('commute') || topCategory.category === 'transportation') {
        return `Here are effective actions to lower your **Transportation** footprint:
1. **Embrace Active Transit**: For trips under 3 km, walk or bicycle. It emits 0 kg CO2e and improves health.
2. **Utilize Public Transit**: Buses and trains emit 70-80% less CO2 per passenger than driving a solo gasoline vehicle.
3. **Efficient Driving Habits**: If driving is required, maintain steady speeds and avoid rapid acceleration, which improves fuel efficiency by up to 15%.
4. **Transition to Hybrid/EV**: Electric cars charged on a standard grid cut transit emissions by 60% compared to conventional gas cars.`;
      }

      if (msg.includes('electricity') || msg.includes('energy') || msg.includes('power') || topCategory.category === 'electricity') {
        return `Here are key ways to trim your **Home Electricity** footprint:
1. **Kill Phantom Power**: Unplug chargers, gaming consoles, and appliances when not in use. They draw energy continuously ("standby load").
2. **Upgrade to LEDs**: LED bulbs consume 75% less energy than traditional incandescents and last 25 times longer.
3. **Optimize Thermostats**: Adjusting your climate controls by just 1-2 degrees Celsius saves roughly 10% on your monthly electric bill.
4. **Switch to Solar/Green Power**: Check if your electricity provider offers green tariffs or enroll in a community solar program to support renewable generation.`;
      }

      // Default recommendations
      return `To help you meet your target of **${profile.dailyGoalKg} kg CO2e/day** (currently at **${totalAvg.toFixed(1)} kg**), here are the three highest-impact steps you can take today:
1. **Replace 1 short car trip** with walking, bicycling, or busing. (Saves ~1.5 - 3.0 kg CO2e).
2. **Swap 1 beef/pork dish** for a delicious plant-based or poultry alternative. (Saves ~1.8 kg CO2e).
3. **Turn off standby electronics** at the power strip before going to sleep. (Saves ~0.4 kg CO2e/day).

Which of these challenges would you like to join?`;
    }

    // Forecast footprint
    if (msg.includes('forecast') || msg.includes('future') || msg.includes('savings')) {
      const optimizedTotal = averages.transportation * 0.5 + averages.electricity * 0.7 + averages.water * 0.8 + averages.food * 0.6 + averages.shopping * 0.5;
      const weeklySavings = (totalAvg - optimizedTotal) * 7;
      const yearlySavings = (totalAvg - optimizedTotal) * 365;
      
      return `### Carbon Savings Forecast 🔮

By adopting moderate sustainable changes (e.g. cutting single car trips by 50%, saving 30% electricity, reducing meat by 40%):
* **Estimated Future Daily Footprint**: **${optimizedTotal.toFixed(1)} kg CO2e/day** (down from your current **${totalAvg.toFixed(1)} kg**)
* **Weekly Carbon Savings**: **${weeklySavings.toFixed(1)} kg CO2e**
* **Annual Carbon Savings**: **${yearlySavings.toFixed(0)} kg CO2e**

*Impact equivalence*: Lowering your footprint by this amount is equivalent to planting **${(yearlySavings / 22).toFixed(0)} mature trees** or taking a gasoline car off the road for **${(yearlySavings / 4600).toFixed(1)} years**!`;
    }

    // Default chat conversational response
    return `Hi ${profile.name}! I am analyzing your daily carbon logs. Your current average is **${totalAvg.toFixed(1)} kg CO2e/day** against your goal of **${profile.dailyGoalKg} kg**. 

How can I help you today? You can ask me how to reduce specific emissions (like food or transportation), check your biggest contributor, or request a carbon savings forecast.`;
  }
};
