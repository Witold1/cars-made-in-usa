<h1 style="margin:0 auto; "> Project "Cars Made in USA" </h1>
<span style="padding-left:15%; ">or Vehicle Components Sourcing Analysis</span>

<h2> 📊 GIF or Video Preview </h2>
  * Placeholder

<h2> 📖 ️Description 🏎 </h2>

  * This is an experimental one-page, dynamic, minimal working product featuring interactive and filterable charts. I extensively used <tt>#AI</tt> (<tt>#LLMs</tt>) to build both the frontend (including page layout, data visualizations, and some data processing) and the backend (including feature generation and the general data flow from <tt>"raw"</tt> to <tt>"final"</tt>).
  * The chart type used is <tt>beeswarm jitter</tt>. This approach allows the display of horizontal ratios for the target variable, ranging from 0% to 100%, while vertically <tt>jittering</tt> points to reduce overplotting and enhance readability.
  * Data comes from [Part 583 American Automobile Labeling Act Reports](https://www.nhtsa.gov/part-583-american-automobile-labeling-act-reports) shared to public by NHTSA. For more details and context of this regulation, see [PART 583—AUTOMOBILE PARTS CONTENT at LABELING at Code of Federal Regulations](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-583) or [49 CFR Part 583 - PART 583—AUTOMOBILE PARTS CONTENT LABELING at Legal Information Institute of Cornell University](https://www.law.cornell.edu/cfr/text/49/part-583). Besides, you can check the ["Evaluation of the American Automobile Labeling Act (NHTSA Publication DOT HS 809 208)"](https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/809208), the report from January 2001 that stated "most consumers were unaware of the existence of the AALA labels".

<h2> 📜 Some Implemented Features 🚙</h2>

  * **Interactive Charts with Extended Tooltips**
    > Hover over a point to see details, such as which Audi model(s) source their transmissions from Japan but engines from Hungary, or which Dodge models partially source their engines from Poland.

  * **Visualizations from Different Perspectives**
    > View cars split by vehicle type<sup>t1</sup>, automotive parent corporation<sup>t2</sup>, or region of the automotive parent corporation<sup>t2</sup>.

  * **Selectable Dynamic Views for Component Sourcing**
    > Toggle between viewing cars by the share of components from North America (including Mexico, per NAFTA) versus "offshore," or by the share of components from the U.S./Canada versus the rest of the world.

  * **Selectable Dynamic Cross-Filtering with Easy Reset**
    > Filter to see where General Motors Company (or Toyota Motor Corporation, Tata Motors, or Geely) sources components for their passenger cars, or where Asian automotive corporations source components for their trucks. Reset all filters easily with a single button.

  * **Window-Size-Based Conditional Notification**  
    > A notification appears if the window width is less than 1024 pixels, recommending a wider screen for the best experience. Rotate your device horizontally or use a modern tablet, laptop, or computer for optimal viewing.

<h2> 💡 Possible Next Steps 🚗</h2>

  * **Refine Data Points for Better Feature Generation**  
    > What region should be assigned to Tata Motors and Geely portfolios after their respective acquisitions (e.g., Jaguar Land Rover or Volvo-Polestar Cars) or to Stellantis after its trans-national merger (e.g., RAM, Dodge, and Alfa Romeo)?  

    > How should re-badged and joint venture cars be classified (e.g., Subaru-Toyota Subaru BRZ-Toyota 86 or GM-Honda Ultium-Prologue-ZDX)?  

    > Should we focus on "platforms" instead of individual cars (e.g., GM VSS-F Trax-Envista-TrailBlazer-EncoreGX or Toyota E210 Corolla-CorollaCross-CorollaGR-CHR)? If so, how?  

    > Why do some manufacturers provide more detailed data (e.g., extra detailed trims for Volkswagen Group or engine info for Ford Motor Company) while others lack it (e.g., the Canadian assembly plant for Chevrolet Equinox from 2018 to 2022)? Why are some sub-corporate cars listed differently (e.g., Buick Trax instead of Chevrolet Trax in 2024)? What did the raw and non-public data submitted to regulators look like?

  * **Add More Filters and Views**  
    > Additional filters can be implemented based on available data, such as brand names (e.g., Lexus and Toyota for Toyota Motor Corporation, or Chevrolet, Buick, Cadillac, GMC for General Motors Company), countries of final assembly plants, or origins of engines and transmissions.

  * **Incorporate Additional Data**  
    > Car-wise sales numbers could be used to determine the size of dots in the beeswarm chart, adding another layer of insight.

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

  For more on React file structures, see [React File Structure](https://react-file-structure.surge.sh/) and [Legacy React Docs](https://legacy.reactjs.org/docs/faq-structure.html).

<h2> 📌 Links </h2>

  > Placeholder

<h2> 🐉 License and Legals </h2>

  Ask before use.
