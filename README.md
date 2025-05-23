<h1 style="margin:0 auto; "> Project "Cars Made in USA" </h1>
<span style="padding-left:15%; ">or Vehicle Components Sourcing Analysis</span>

<h2> 📊 GIF or Video Preview </h2>
  * Placeholder

<h2> 📖 ️Description 🏎 </h2>

  * This is an experimental one-page, dynamic, minimal working product featuring interactive and filterable charts. I extensively used <tt>#AI</tt> (<tt>#LLMs</tt>) to build both the frontend (including page layout, data visualizations, and some data processing) and the backend (including feature generation and the general data flow from <tt>"raw"</tt> to <tt>"final"</tt>).
  * The chart type used is <tt>beeswarm</tt> or <tt>jitter</tt> chart. This approach allows the display of horizontal ratios for the target variable, ranging from 0% to 100%, while vertically <tt>jittering</tt> points to reduce overplotting and improve readability.
  * Data comes from **[Part 583 American Automobile Labeling Act Reports](https://www.nhtsa.gov/part-583-american-automobile-labeling-act-reports)** shared to public by National Highway Traffic Safety Administration. For more details and context of this regulation, see _Title 49 CFR Part 583 - Automobile Parts Content Labeling_ on _[Electronic Code of Federal Regulations (eCFR)](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-583)_ or _[Legal Information Institute, Cornell University](https://www.law.cornell.edu/cfr/text/49/part-583)_. In addition, you can check the ["Evaluation of the American Automobile Labeling Act (NHTSA Publication DOT HS 809 208)"](https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/809208), a report from January 2001 that stated "most consumers were unaware of the existence of the AALA labels".

<h2> 📜 Some Implemented Features 🚙</h2>

  * **Interactive Charts with Extended Tooltips**
    > Hover over a point to see details, such as which Audi model(s) source their transmissions from Japan but engines from Hungary, or which Dodge models partially source their engines from Poland.

  * **Visualizations from Different Perspectives**
    > View cars split by vehicle type<sup>t1</sup>, manufacturer parent corporation<sup>t2</sup>, or region of the manufacturer parent corporation<sup>t2</sup>.

  * **Selectable Dynamic Views for Component Sourcing**
    > Toggle between viewing cars by the share of components from North America (including Mexico, per NAFTA) versus "offshore," or by the share of components from the U.S./Canada versus the rest of the world.

  * **Selectable Dynamic Cross-Filtering with Easy Reset**
    > Filter to see where General Motors Company (or Toyota Motor Corporation, Tata Motors, or Geely) sources components for their passenger cars, or where Asian automotive corporations source components for their trucks. Reset all filters easily with a single button.

  * **Window-Size-Based Conditional Notification**  
    > A notification appears if the window width is less than 1024 pixels, recommending a wider screen for the best experience. Rotate your device horizontally or use a modern tablet, laptop, or computer for optimal viewing.

    <sup>t1</sup> vehicle types are defined as in datasource
    <sup>t2</sup> manufacturer parent corporation as defined as feature generated by AI

<h2> 💡 Possible Next Steps 🚗</h2>

  * **Refine Data Points for Better Feature Generation**  
    > What region should be assigned to Tata Motors and Geely portfolios after their respective acquisitions (e.g., Jaguar Land Rover or Volvo-Polestar Cars) or to Stellantis after its trans-national mergers (e.g., RAM, Dodge, and Alfa Romeo)? how to handle brands belonged to "lean" mergers (e.g., Mitsubishi Motors Corporation or Nissan North America, Inc and Renault–Nissan–Mitsubishi Alliance)?

    > How should re-badged and joint venture cars be classified (e.g., Subaru-Toyota Subaru BRZ-Toyota 86 or GM-Honda Ultium-Prologue-ZDX)?  

    > Should we focus on "platforms" instead of individual cars (e.g., GM VSS-F Trax-Envista-TrailBlazer-EncoreGX or Toyota E210 Corolla-CorollaCross-CorollaGR-CHR)? If so, how?  

    > Why do some manufacturers provide more detailed data (e.g., extra detailed trims for Volkswagen Group or engine info for Ford Motor Company, extra-detailed rows for Honda CR-V) while others lack it (e.g., the Canadian assembly plant for Chevrolet Equinox from 2018 to 2022)? Why are some sub-corporate cars listed differently (e.g., Buick Trax instead of Chevrolet Trax in 2024)? What did the raw and non-public data submitted to regulator look like?

  * **Add More Filters and Views**  
    > Additional filters can be implemented based on available data, such as brand names (e.g., Lexus and Toyota for Toyota Motor Corporation, or Chevrolet, Buick, Cadillac, GMC for General Motors Company), countries of final assembly plants, or origins of engines and transmissions.

  * **Incorporate Additional Data**  
    > Car-wise sales numbers could be used to determine the size of dots in the beeswarm chart, adding another layer of insight.

    > Market segments and car sizes could replace generic "vehicle types" classification from raw data, for example "compact - small - medium (two rows) - medium (three rows) - full size - executive" and "sedan (car) - suv (wagon) - truck (unibody) - truck (body-on-frame) - minivan"

<h2> 📁 Structure of repository </h2>

  ```
  +--frontend                  <- Folder for frontend components
  ¦  L--public                 <- ... Static assets and data files
  ¦  L--placeholder            <- ... Placeholder folder
  ¦  
  +--backend                   <- Folder for backend components
  ¦  L--data                   <- ... Data processing datasets
  ¦  L--placeholder            <- ... Placeholder folder
  ¦
  +--index.html                <- Web page to serve online
  +--README.md                 <- Top-level README describing this project
  ```

<h2> 📌 Links </h2>

  * ["Auto Index" by Kogod School of Business, American University](https://kogod.american.edu/autoindex) (academic research)
  * ["Looking for an American-made vehicle? How the automakers stack up" by USA TODAY](https://www.usatoday.com/story/graphics/2025/04/05/which-cars-vehicles-made-in-america/82758650007/) (very nice brand cards, interactive table)
  * ["How 25% Tariffs on All Imported Cars Will Affect Every Model" by CarAndDriver](https://www.caranddriver.com/news/a64308066/list-of-how-tariffs-will-affect-every-car/)
  * ["Visualized: Where Automakers Build Cars Sold in America" by Visual Capitalist](https://www.visualcapitalist.com/visualized-where-automakers-build-cars-sold-in-america)
  * ["What Cars Are Made In America? \[Infographic\]" by CarCityWholesale](https://www.carcitywholesale.com/what-cars-are-made-in-america.htm)

<h2> 🐉 License and Legals </h2>

  Ask before use.
