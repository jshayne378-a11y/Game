/* ===========================================================
   DRIFT — Menu Prep Data
   Source: Drift Full Menu (Opal Sol, Clearwater Beach)
   =========================================================== */

function mi(name, price, desc, tags) {
  return {
    name: name,
    price: String(price),
    value: parseFloat(String(price)),
    desc: desc || '',
    tags: tags || []
  };
}

var MENU_SECTIONS = [
  {
    id: 'all-day',
    title: 'All-Day Menu',
    short: 'All-Day',
    blurb: 'Available all day — boards, dips, flatbreads, salads, handhelds & favorites.',
    color: '#c98a3d',
    categories: [
      {
        title: 'Aged + Cured',
        items: [
          mi('Artisan Cheese Board', 27, 'tasting of midnight moon gouda, rogue creamery, chocolate stout cheddar, green hill double cream brie, stone fruit mostarda, fig almond bread'),
          mi('Farmers Board', 32, 'selection of european cured meats: prosciutto, finocchiona, coppa, tasting of artisan cheese, truffle mustard, housemade pickles, fig almond bread')
        ]
      },
      {
        title: "Chef's Galley — Dips + Spreads",
        items: [
          mi('Stone-Fired Eggplant', 14, 'black garlic, meyer lemon evoo, smoked sea salt, herbed lavash', ['V']),
          mi('Spicy Moroccan Hummus', 14, 'whipped chickpea, tapenade, espelette oil, herbed lavash, organic baby vegetables', ['V']),
          mi('Skillet Focaccia', 12, 'rosemary, roasted garlic, smoked sea salt, wild blueberry butter, parmesan fonduta'),
          mi('Whipped Feta', 14, 'hot honey, tomato compote, toasted pine nuts, evoo, herbed lavash, organic baby vegetables')
        ]
      },
      {
        title: 'Social + Unique',
        items: [
          mi('Maple & Pomegranate-Glazed Brussels Sprouts', 14, 'roasted root vegetables, shaved marcona almonds', ['GF', 'V']),
          mi('Lobster & Avocado Toast', 27, 'preserved lemon aioli, american caviar, cured egg yolk, petite greens, toasted brioche'),
          mi('Ahi Tuna Poke', 19, 'local mango, crushed macadamia nuts, scallions, crispy wonton chips', ['RAW']),
          mi('Chilled Jumbo Shrimp', 20, 'classic cocktail sauce, pickled vegetables, charred lemon'),
          mi('Pan-Roasted Mussels', 19, 'spanish chorizo, sweet onion, stewed tomato, sherry, chili flake, unfiltered evoo, fettunta'),
          mi('Charred Pulpo', 26, 'braised spanish octopus, chorizo spice, crispy potato salad, saffron aioli, sauce verde')
        ]
      },
      {
        title: 'Warming',
        items: [
          mi('Maine Lobster Bisque', 15, 'lobster chunks, crostini, micro-herbs')
        ]
      },
      {
        title: 'Stone-Fired Flatbreads',
        note: 'Cooked at 600°F in a stone oven for a light, crispy crust. Gluten-free dough available.',
        items: [
          mi('Margherita', 19, 'fior di latte mozzarella, hand torn basil, crushed san marzano tomatoes, first press evoo'),
          mi('Ultimo', 21, 'spicy sausage, old world pepperoni, mozzarella, crushed san marzano tomatoes, torn basil'),
          mi('Wild Mushroom', 20, 'butter-poached mushrooms, cauliflower truffle cream, aged gouda, young arugula, shaved grana padano')
        ]
      },
      {
        title: 'Big Drift Salads',
        items: [
          mi('Drift Chicken Bowl', 20, 'herb-marinated free-range chicken, shaved brussels sprouts, baby greens, heirloom tomato, persian cucumber, bucheron goat cheese, pomegranate, puffed quinoa, preserved lemon vinaigrette', ['GF']),
          mi('Lobster Cobb', 29, 'cold water lobster salad, crisp romaine, peppered applewood smoked bacon, heirloom tomato, cucumber, chopped egg, creamy tarragon dressing', ['GF']),
          mi('Grilled Chicken Caesar', 19, 'crisp romaine, herb focaccia croutons, shaved grana padano, crunchy parmesan streusel, creamy caesar dressing (spanish anchovies on request)'),
          mi('Ora King Salmon', 25, 'lemon & coriander-dusted, power 3 greens, ancient grains, heirloom tomato, cucumber, dried cranberries, toasted almonds, roasted apple vinaigrette', ['RAW']),
          mi('Smoky Steak Power Bowl', 28, 'flame-grilled sirloin, power greens, toasted farro, marinated tomato, charred asparagus, salt roasted beets, fire-roasted artichokes, maytag blue cheese, honey shallot vinaigrette', ['RAW'])
        ]
      },
      {
        title: 'Handhelds',
        note: 'Served with spicy b & b pickles and choice of seasoned fries or superfood slaw.',
        items: [
          mi('Bistro Steak', 26, 'herb-marinated strip loin, black garlic aioli, smoked mozzarella, caramelized onion, roasted tomato, baby arugula, artisan ciabatta', ['RAW']),
          mi('Spicy Fish Tacos', 21, 'local catch, chipotle avocado mayo, charred corn relish, crunchy slaw, cilantro crema'),
          mi('Roasted Harissa Chicken', 17, "whipped feta, shredded lettuce, za'atar-spiced cucumber salad, local tomato, grilled naan bread"),
          mi('Classic Steak Burger', 18, 'signature beef blend, drift sauce, griddled brioche, choice of cheese: american, cheddar, swiss, provolone — add bacon +2', ['RAW']),
          mi('Drift Burger', 21, 'signature beef blend, roasted wild mushrooms, red onion marmalade, smoked mozzarella, truffle aioli, crispy shallots, butter-griddled brioche', ['RAW']),
          mi('Crispy Chicken Cabana', 17, 'southern-style buttermilk chicken, crisp lettuce, tomato, dill pickle slices, roasted garlic aioli, toasted potato roll')
        ]
      },
      {
        title: 'All-Day Favorites',
        items: [
          mi('Steak Frites', 32, 'herb-rubbed strip steak, seasoned pommes frites, oven-dried tomato & arugula salad, ricotta salata, spicy bravas sauce', ['GF', 'RAW']),
          mi('Gemelli Pasta', '14/21', 'oven-dried tomato, english peas, charred peppers, baby spinach, san marzano tomatoes, ricotta salata, torn basil, first pressed evoo — half / full'),
          mi('Hand-Tossed Chicken Tagliatelle', '16/27', 'butter-poached mushrooms, braised power greens, truffle taleggio cream, cured egg yolk — half / full'),
          mi('Pappardelle Bolognese', '16/26', 'milk-braised veal, pork and beef ragu, san marzano tomatoes, stracciatella, pecorino toscano cheese — half / full')
        ]
      }
    ]
  },
  {
    id: 'dinner',
    title: 'Dinner Menu',
    short: 'Dinner',
    blurb: 'Available after 5pm — small plate salads and Drift specialties.',
    color: '#4a7c8c',
    categories: [
      {
        title: 'Small Plate Salads',
        note: 'Available after 5pm.',
        items: [
          mi('Beets & Burrata', 14, 'salt-roasted golden beets, charred asparagus, whipped burrata, golden frisee, local honey, pickled red onion, pistachio crumble'),
          mi('Tuscan', 13, 'baby lettuces, heirloom tomato, cucumber, goat cheese, puffed quinoa, toasted almonds, lemon raisin vinaigrette', ['GF']),
          mi('Little Gem Wedge', 14, 'marinated heirloom tomatoes, applewood smoked bacon, maytag blue cheese, pickled red onions, buttermilk herb dressing'),
          mi('Hearts Of Romaine', 13, 'crisp romaine, herb focaccia croutons, shaved grana padano, crunchy parmesan streusel, creamy caesar dressing (spanish anchovies on request)')
        ]
      },
      {
        title: 'Drift Specialties — Off-Shore',
        note: 'Available after 5pm.',
        items: [
          mi('Pan-Seared Grouper', 44, 'parsnip potato purée, root vegetable caponata, charred broccolini, sauce romesco', ['GF']),
          mi('Coastal Shellfish Stew', 49, 'charred fennel & tomato broth, mussels, lobster, shrimp, local catch, grilled toast, lemon saffron aioli'),
          mi('Crispy Branzino', 49, 'saffron fregola, warm asparagus salad, lemon parsley chermoula, tomato-cumin butter, crispy shallots'),
          mi('Ora King Salmon Ala Plancha', 38, 'root vegetable couscous, golden raisins, pine nuts, tomato & olive tapenade, preserved lemon butter', ['RAW'])
        ]
      },
      {
        title: 'Drift Specialties — Land-Locked',
        note: 'Available after 5pm.',
        items: [
          mi('Pollo Al Mattone', 33, 'bell & evans free-range chicken, baby potatoes, roasted root vegetables, lemon raisin marmalata, natural pan sauce', ['GF']),
          mi('Beef Tenderloin', 59, '8oz center-cut, goat cheese & basil crust, parmesan whipped potatoes, grilled asparagus, red onion agrodolce, 25-year balsamico', ['GF', 'RAW']),
          mi('Bone-In Ribeye', 65, 'rosemary & sea salt crusted beef, roasted wild mushrooms, potato gratin, charred asparagus, sauce bordelaise', ['RAW']),
          mi('Rack Of Lamb', 52, 'crispy goat cheese polenta, cipollini balsamic, roasted brussels sprouts, gremolata, barolo reduction', ['RAW'])
        ]
      }
    ]
  },
  {
    id: 'dessert',
    title: 'Dessert Menu',
    short: 'Dessert',
    blurb: 'Sweets, boozy dessert cocktails, and specialty coffee.',
    color: '#a8548b',
    categories: [
      {
        title: 'Sugared, Baked & Torched',
        items: [
          mi('Chocolate Espresso Pot De Crème', 13, 'chantilly cream, chocolate hazelnut biscotti'),
          mi('Brûléed Ricotta Cheesecake', 13, 'amaretto, blueberry compote, lemon curd, almond graham cracker crust'),
          mi('Brown Butter Pear Cake', 14, 'walnuts, caramelized pear, vanilla bean gelato'),
          mi('Pistachio Tiramisu', 13, 'espresso-soaked savoiardi ladyfingers, mascarpone cheese, coffee liqueur, cocoa powder, pistachio cream, shaved chocolate'),
          mi('Ice Box Selection', 9, 'vanilla bean gelato, dark chocolate gelato, maple roasted butter pecan, raspberry sorbet, mango sorbet')
        ]
      },
      {
        title: 'Drink Your Dessert',
        note: 'Dessert cocktails.',
        items: [
          mi('Key Lime Pie Martini', 16, 'stoli vanilla vodka, cointreau, pressed key lime, cream of coconut, simple syrup, graham cracker rim'),
          mi('Lemon Meringue Martini', 16, 'stoli vanilla vodka, limoncello, fresh-pressed lemon, agave nectar, cream of coconut, graham cracker crumb rim, torched meringue cloud, lemon zest'),
          mi('Samoa Martini', 16, "stoli salted karamel vodka, crème de cacao, coconut cream, milk, chocolate drizzle, toasted coconut"),
          mi('Crème Brûlée Martini', 16, 'crème brûlée liqueur, stoli vanilla vodka, half & half, caramel syrup rim')
        ]
      },
      {
        title: 'Mug Up',
        note: 'Specialty coffee & espresso drinks.',
        items: [
          mi('Deckhand', 15, "fresh-brewed coffee, baileys irish cream, kahlúa, whipped cream, chocolate shavings"),
          mi('Irish Coffee', 14, "fresh-brewed coffee, tullamore d.e.w. irish whiskey, dark cane sugar, syrup, local cream float"),
          mi('KGB', 14, "fresh-brewed coffee, kahlúa, grand marnier, baileys irish cream, local cream float"),
          mi('Nutty Captain', 14, "fresh-brewed coffee, baileys irish cream, frangelico, local whipped cream float"),
          mi('Island Coffee', 14, 'fresh-brewed coffee, rum and amaretto — sweet and nutty, caribbean style'),
          mi('Cappuccino or Latte', 6, 'single shot'),
          mi('Espresso', 5, 'single shot')
        ]
      }
    ]
  },
  {
    id: 'spirit-room',
    title: 'Spirit Room',
    short: 'Spirits',
    blurb: 'Handcrafted cocktails, mojitos, margaritas, beer & spirit-free drinks.',
    color: '#3f6b4a',
    categories: [
      {
        title: 'Handcrafted Cocktails',
        items: [
          mi('Anchors Aweigh', 15, "tito's handmade vodka, pressed pineapple, lime, agave, mint, tiki bitters"),
          mi('Wave Bender Old Fashioned', 15, 'bacardi anejo cuatro 4yr rum, filthy cherry syrup, angostura bitters, chocolate bitters'),
          mi('Stoli Blueberry Fog', 15, 'stoli blueberry vodka, st-germain liqueur, fresh-pressed lemon, elderflower foam, blueberry pick'),
          mi('21 Seeds Paloma', 15, '21 seeds grapefruit hibiscus tequila, fresh-pressed lime, agave, fever-tree sparkling pink grapefruit'),
          mi('Ocean Mist Mule', 15, 'grey goose la poire vodka, st-germain elderflower liqueur, pressed lemon, grapefruit bitters, ginger beer'),
          mi('The Smoking Gun', 16, 'ilegal mezcal, stinging bee syrup, pressed pineapple & lime, smoked chili bitters'),
          mi('Strawberry Aperol Spritz', 15, 'aperol, strawberries, pressed lemon & agave, topped with la marca prosecco'),
          mi('Black Cherry Old Fashioned', 16, "maker's mark bourbon, simple syrup, cherry bitters"),
          mi('Infused & Twisted', 16, "tito's handmade vodka, effen cucumber vodka, pressed cucumber & lime, agave, basil, fever-tree elderflower tonic"),
          mi('Perfect Storm Punch', 15, 'diplomatico planas and mantuano aged rums, dry curaçao, pressed lime & pineapple'),
          mi('Oceanside Mary "House Specialty"', 16, "tito's handmade vodka, san marzano tomatoes, lemon & celery juices, balsamic vinegar, horseradish, celtic sea salt, old bay rim, rosemary-skewered olive, cherry tomato, spicy pepper"),
          mi('Ultimate Manhattan', 17, 'woodford reserve bourbon, sweet vermouth, angostura bitters, filthy cherry')
        ]
      },
      {
        title: 'Mojitos',
        items: [
          mi('Carlisle Cocojito', 15, 'rumhaven coconut water rum, pressed lime, agave, mint, splash of bubbles'),
          mi('Tropical', 16, 'corvus tropical vodka, chinola passion fruit liqueur, pressed lime and agave, mint, sparkling soda'),
          mi('Agave', 15, 'bacardi superior rum, pressed lime, mint, agave, splash of bubbles')
        ]
      },
      {
        title: 'Margaritas',
        items: [
          mi("Classic Tommy's Margarita", 15, 'sauza hacienda silver tequila, pressed lime & agave'),
          mi('Milagro Silver Cloud Margarita', 16, 'milagro silver tequila, pomegranate juice, fresh-pressed lime, float of grand marnier "sea foam"')
        ]
      },
      {
        title: 'Straight Up!',
        items: [
          mi('Sundrift', 17, 'patron reposado tequila, chinola passion fruit liqueur, lillet blanc, pressed lemon, agave nectar'),
          mi('Espresso Martini', 17, 'stoli vanilla vodka, kahlúa, crème de cacao, espresso'),
          mi('Prosecco Colada', 16, 'rumhaven coconut water rum, cream of coconut, freshly pressed pineapple, benvolio prosecco, pineapple wedge'),
          mi('Clover Club', 17, "hendrick's gin, pressed lemon, raspberry \"sea foam\""),
          mi('Dirty Water Martini', 17, "hendrick's gin or tito's handmade vodka, dry vermouth, olive brine, choice of stuffed olive")
        ]
      },
      {
        title: 'Spirit-Free Cocktails',
        items: [
          mi('Raspberry Smash', 8, 'fresh-pressed raspberries, persian lime and valencia orange juices, organic agave nectar'),
          mi('Blueberry Nojito', 8, 'hand-picked mint, pressed persian lime, ripe blueberries, organic agave nectar, topped with bubbles')
        ]
      },
      {
        title: 'Ice Cold Brews — From The Handle',
        items: [
          mi('Goose Island IPA', 8, 'Chicago, IL — 5.9% ABV — hoppy, grapefruity, refreshing'),
          mi('Modelo Especial', 8, 'Mexico — 4.4% ABV — light, sweet malt character, notes of corn and grain, mild hop bitterness'),
          mi('Stella Artois', 8, 'Leuven, Belgium — 5.2% ABV — balances fruity, malty sweetness with crisp hop bitterness, soft dry finish'),
          mi('Michelob Ultra', 8, 'St. Louis, MO — 4.2% ABV — light and refreshing with mild grain notes, gentle hop bitterness')
        ]
      },
      {
        title: 'From The Neck',
        items: [
          mi('Domestic', 6.5, "budweiser, bud light, miller lite, michelob ultra"),
          mi('Imported & Premium', 7, 'corona extra, corona light, heineken, sol cerveza'),
          mi('Heineken 0.0', 6, 'alcohol free')
        ]
      },
      {
        title: 'Local & American Craft',
        items: [
          mi('3 Daughters Beach Blonde Ale', 8, 'Clearwater, FL — 5% ABV — balance of malty sweetness with a hint of citrus'),
          mi('3 Daughters Florida Orange IPA', 8, 'Clearwater, FL — 6.9% ABV — juicy florida oranges swim with citrusy, aromatic hops'),
          mi('Cigar City Jai Alai IPA', 7, 'Tampa, FL — 7.5% ABV — tangerine and candied orange peel, clementine, valencia orange, rich malt'),
          mi('Kona Big Wave Golden Ale', 7, 'Makaha, HI — 4.5% ABV — lighter-bodied, tropical hop aroma, smooth easy drinking'),
          mi('Florida Avenue Luminescence Hazy IPA', 8, 'Tampa, FL — 7% ABV — double dry-hopped, bright juicy tropical fruit, pillowy mouthfeel'),
          mi('Coppertail Night Swim Porter', 8, 'Tampa, FL — 6.2% ABV — dark, rich and roasty with chocolate notes'),
          mi('Coppertail Fallen Fruit Hard Cider', 7, 'Tampa, FL — 6% ABV — hardy dry english cider, crisp apple flavor'),
          mi('High Noon Sun Sips Hard Seltzer', 8, 'real vodka + real juice, low sugar, gluten-free')
        ]
      }
    ]
  },
  {
    id: 'wine',
    title: 'Wine',
    short: 'Wine',
    blurb: 'By-the-glass pours, Coravin reserve, and the full bottle list.',
    color: '#7a3b3b',
    categories: [
      {
        title: 'By The Glass — Sparkling, White & Rosé',
        items: [
          mi('La Marca Prosecco (split)', 14, 'Italy — light, refreshing, crisp'),
          mi('Moët & Chandon Brut Impérial (split)', 30, 'Champagne, France — citrus, honey, floral, minerals and brioche'),
          mi('Emmolo Sauvignon Blanc', 13, 'Napa-Solano Counties, California — bright lemon blossom on entry, echoes of peach'),
          mi('Kim Crawford Sauvignon Blanc', 15, 'Marlborough, New Zealand — bold stone fruit, grassiness'),
          mi('Benvolio Pinot Grigio', 13, 'Friuli, Italy — green apple, pear, crisp and clean finish'),
          mi('La Crema Pinot Gris', 15, 'Monterey, California — meyer lemon, bosc pear and nectarine'),
          mi('A to Z Wineworks Pinot Gris', 14, 'Oregon — lemon, pineapple heart, fresh-cut pears and star fruit'),
          mi('Chateau Ste. Michelle Riesling', 13, 'Columbia Valley, Washington — sweet lime and peach with subtle mineral notes'),
          mi('William Hill Estate Winery Chardonnay', 13, 'California — brown spice, citrus and tropical fruit'),
          mi("Kendall-Jackson Vintner's Reserve Chardonnay", 14, 'California — baked apple, accents of butter and vanilla'),
          mi('Fleur de Mer Côtes de Provence Rosé', 15, 'Provence, France — elegant, balanced'),
          mi('Hampton Water Rosé', 17, 'Languedoc-Roussillon, France — clean and fresh, bright red fruit flavors'),
          mi('Martín Códax Albariño', 16, 'Rías Baixas, Spain — medium-bodied, crisp, dry finish with bright fruit and floral notes')
        ]
      },
      {
        title: 'By The Glass — Red',
        items: [
          mi('A to Z Wineworks Pinot Noir', 13, 'Oregon — blackberry, black cherry, pomegranate'),
          mi('J Vineyards Pinot Noir', 15, 'Monterey, Sonoma, Santa Barbara, California — red cherry, raspberry, wild strawberry and spice'),
          mi('La Crema Pinot Noir', 18, 'Sonoma, California — cocoa, allspice, black tea notes'),
          mi('Ghost Pines Merlot', 14, 'Napa & Sonoma, California — dark berries, licorice and espresso, lots of richness'),
          mi('Robert Mondavi Private Selection Cabernet Sauvignon', 13, 'California — dark berry fruits and velvety tannins'),
          mi('Prati by Louis M. Martini Cabernet Sauvignon', 15, 'Sonoma County, California — black cherry, blackberry and cassis'),
          mi('Silver Palm Cabernet Sauvignon', 14, 'California — silky cassis, spice'),
          mi('Brancaia Tre Super Tuscan', 17, 'Tuscany, Italy — red cherry, plum and blackberry, hints of spice and dried herbs'),
          mi('Gascón Malbec', 13, 'Mendoza, Argentina — full bodied, rich dark fruit flavors, soft tannins')
        ]
      },
      {
        title: 'Featured Wines from Orin Swift',
        note: 'Priced Glass / Bottle.',
        items: [
          mi('Blank Stare Sauvignon Blanc', '21/82', 'Orin Swift by David Phinney — glass $21 / bottle $82'),
          mi('Mannequin Chardonnay', '17/66', 'Orin Swift by David Phinney — glass $17 / bottle $66'),
          mi('Abstract Red Blend', '16/62', 'Orin Swift by David Phinney — glass $16 / bottle $62'),
          mi('8 Years in the Desert Red Zinfandel', '23/90', 'Orin Swift by David Phinney — glass $23 / bottle $90'),
          mi('Palermo Cabernet Sauvignon', '29/114', 'Orin Swift by David Phinney — glass $29 / bottle $114')
        ]
      },
      {
        title: 'Coravin Reserve Wine Selection',
        note: 'Poured by the glass using Coravin to preserve freshness.',
        items: [
          mi('Stonestreet Cabernet Sauvignon', 32, 'Alexander Valley, Sonoma County, California — raspberry, dried blood orange, violet and black tea'),
          mi('Duckhorn Merlot', 27, 'Napa Valley, California — red currant, ripe plum and fig compote'),
          mi('Rombauer Vineyards Pinot Noir', 30, 'Santa Lucia, California — vibrant red fruit flavors, subtle earthiness and warm spice'),
          mi('Caymus Cabernet Sauvignon', 48, 'Napa Valley, California — dark fruit, vanilla, cocoa and sweet tobacco, velvety texture'),
          mi('Prunotto Barolo', 35, 'Piedmont, Italy — nebbiolo grapes, deep garnet, complex red fruit/floral/spice, silky tannin')
        ]
      },
      {
        title: 'Wine List — Sparkling & Champagne',
        note: 'Bottle price.',
        items: [
          mi('La Marca, Prosecco DOC, Italy', 48, 'Sparkling & Champagne'),
          mi('Korbel, Sparkling Brut, California', 50, 'Sparkling & Champagne'),
          mi('Ruffino, Prosecco Rosé, Italy NV', 57, 'Sparkling & Champagne'),
          mi('Raventós i Blanc, Blanc de Blancs, Penedès, Spain', 60, 'Sparkling & Champagne'),
          mi('J Vineyards, Cuvée, Russian River Valley, California', 90, 'Sparkling & Champagne'),
          mi('Henriot Brut Souverain, Reims, France NV', 105, 'Sparkling & Champagne'),
          mi('Moët & Chandon, Impérial, Brut, Épernay, France NV', 118, 'Sparkling & Champagne'),
          mi('Veuve Clicquot, Yellow Label, Brut, Reims, France NV', 148, 'Sparkling & Champagne'),
          mi('Perrier-Jouët, Blanc de Blancs, France NV', 170, 'Sparkling & Champagne'),
          mi('Dom Pérignon, Prestige Cuvée, France', 475, 'Sparkling & Champagne')
        ]
      },
      {
        title: 'Wine List — Riesling / Rosé',
        note: 'Bottle price.',
        items: [
          mi('Chateau Ste. Michelle, Riesling, Columbia Valley, Washington', 54),
          mi("August Kesseler, 'R', Riesling Kabinett, Rheingau, Germany", 56),
          mi('Fleur de Mer, Rosé, Côtes de Provence, France', 58),
          mi('Hampton Water, Rosé, Languedoc-Roussillon, France', 66),
          mi('Whispering Angel, Rosé, Côtes de Provence, France', 74)
        ]
      },
      {
        title: 'Wine List — Pinot Grigio / Gris',
        note: 'Bottle price.',
        items: [
          mi('Benvolio, Pinot Grigio, DOC Friuli, Italy', 50),
          mi('A to Z Wineworks, Pinot Gris, Oregon', 54),
          mi('La Crema, Pinot Gris, Monterey, California', 58),
          mi('Jermann, Pinot Grigio, Friuli-Venezia Giulia, Italy', 62),
          mi('Massican, Pinot Grigio, California', 72)
        ]
      },
      {
        title: 'Wine List — Sauvignon Blanc',
        note: 'Bottle price.',
        items: [
          mi('Emmolo, Napa-Solano, California', 50),
          mi('Kim Crawford, Marlborough, New Zealand', 58),
          mi('Matanzas Creek, Sonoma County, California', 65),
          mi('Blindfold, Sonoma', 72),
          mi('Cloudy Bay, Marlborough, New Zealand', 75),
          mi('Jayson by Pahlmeyer, Napa Valley, California', 78),
          mi('Blank Stare, Sonoma County, California', 82)
        ]
      },
      {
        title: 'Wine List — Chardonnay',
        note: 'Bottle price.',
        items: [
          mi('William Hill Estate Winery, Central Coast, California', 50),
          mi("Kendall-Jackson, Vintner's Reserve, California", 54),
          mi('Mer Soleil, Reserve, Santa Lucia Highlands, California', 62),
          mi('Sonoma-Cutrer, Russian River Ranches, Sonoma, California', 64),
          mi('Mannequin, California', 66),
          mi('Beringer, Luminus, Napa Valley, California', 70),
          mi('The Prisoner, Napa County, California', 72),
          mi('Louis Michel & Fils, Chablis, Burgundy, France', 78),
          mi('Domaine Laroche, Chablis, Saint Martin, France', 80),
          mi('Rombauer Vineyards, Carneros, California', 82),
          mi('Patz & Hall, Sonoma Coast, California', 85),
          mi('Cakebread, Napa Valley, California', 95),
          mi('Lingua Franca, Estate, Eola-Amity Hills, Oregon', 100),
          mi('Capensis, Western Cape, South Africa', 125),
          mi('Louis Latour, Chassagne-Montrachet, Côte de Beaune, France', 180)
        ]
      },
      {
        title: 'Wine List — Other Whites',
        note: 'Bottle price.',
        items: [
          mi("Ruffino, Moscato d'Asti, Italy", 50),
          mi('Conundrum, White Blend, California', 52),
          mi('Pieropan, Soave Classico, Veneto, Italy', 54),
          mi('Martín Códax, Albariño, Rías Baixas, Galicia, Spain', 62),
          mi('Domaine Sigalas, Assyrtiko Blend, Santorini, Greece', 85)
        ]
      },
      {
        title: 'Wine List — Pinot Noir',
        note: 'Bottle price.',
        items: [
          mi('A to Z Wineworks, Oregon', 50),
          mi('J Vineyards, Monterey, Sonoma, Santa Barbara, California', 58),
          mi('Simi, Russian River Valley, California', 60),
          mi('La Crema, Sonoma Coast, California', 70),
          mi('Siduri, Willamette Valley, Oregon', 75),
          mi('Jean-Claude Boisset, Bourgogne, Burgundy, France', 80),
          mi('Willamette Valley Vineyards, Estate, Willamette Valley, Oregon', 85),
          mi('Brewer-Clifton, Santa Rita Hills, California', 92),
          mi('Rombauer Vineyards, Santa Lucia Highlands, California', 118)
        ]
      },
      {
        title: 'Wine List — Distinctive Blends',
        note: 'Bottle price.',
        items: [
          mi('Conundrum, California', 50),
          mi('The Prisoner Wine Company, Unshackled, California', 52),
          mi('Torres, Altos Ibéricos, Crianza Rioja DOC, Spain', 54),
          mi('Abstract by Orin Swift, California', 62),
          mi('Brancaia, Tre, Toscana, Tuscany, Italy', 64),
          mi('Caymus-Suisun, The Walking Fool, Suisun Valley, California', 68),
          mi('Spring Valley Vineyards, Frederick, Walla Walla, Washington', 75),
          mi('The Prisoner, Napa Valley, California', 85),
          mi('Duckhorn, Napa Valley, California', 106),
          mi('Château Lassègue, Saint-Émilion Grand Cru, France', 126),
          mi('Penfolds, Bin 389, South Australia', 140),
          mi('Booker, Oublié, Paso Robles, California', 149)
        ]
      },
      {
        title: 'Wine List — Merlot',
        note: 'Bottle price.',
        items: [
          mi('Ghost Pines, Sonoma/Napa Valley, California', 54),
          mi('Northstar, Columbia Valley, Washington', 75),
          mi('Matanzas Creek, Alexander Valley, California', 85),
          mi('Duckhorn, Napa Valley, California', 106),
          mi('La Jota, Howell Mountain, Napa Valley, California', 158)
        ]
      },
      {
        title: 'Wine List — Other Interesting Reds',
        note: 'Bottle price.',
        items: [
          mi('Gascón, Malbec, Mendoza, Argentina', 50),
          mi('E. Guigal, Syrah/Grenache/Mourvèdre, Côtes du Rhône, France', 56),
          mi('Allegrini, Valpolicella, Veneto, Italy', 60),
          mi('Red Schooner, Voyage 12, Malbec, Mendoza, Argentina', 70),
          mi("Stags' Leap Winery, Petite Sirah, Napa Valley, California", 76),
          mi('Orin Swift Cellars, 8 Years in the Desert, Zinfandel, California', 90),
          mi('Prunotto, Barolo, Piedmont, Italy', 138),
          mi('Ruffino, Alauda, Toscana IGT, Italy', 230)
        ]
      },
      {
        title: 'Wine List — Cabernet Sauvignon',
        note: 'Bottle price.',
        items: [
          mi('Robert Mondavi, Private Selection, California', 50),
          mi('Silver Palm, California', 54),
          mi('Prati by Louis M. Martini, Sonoma County, California', 58),
          mi('Simi, Sonoma County, California', 60),
          mi('Beringer Vineyards, Estate Selection, Knights Valley, California', 64),
          mi('My Favorite Neighbor, Paso Robles, California', 78),
          mi('Quilt, Napa Valley, California', 80),
          mi('The Prisoner, Napa Valley, California', 95),
          mi('La Crema, Sonoma County, California', 96),
          mi('Orin Swift Cellars, Palermo, Napa Valley, California', 114),
          mi('Mount Veeder, Napa Valley, California', 115),
          mi('Stonestreet, Estate, Alexander Valley, Sonoma County, California', 125),
          mi('Groth, Napa Valley, California', 125),
          mi("Stag's Leap Wine Cellars, Artemis, Napa Valley, California", 160),
          mi('Justin, Isosceles, Paso Robles, California', 168),
          mi('Mt. Brave, Mt. Veeder, Napa Valley, California', 175),
          mi('Caymus, Napa Valley, California', 190),
          mi('Silver Oak, Alexander Valley, California', 205),
          mi('Cade, Howell Mountain, Napa Valley, California', 210),
          mi('BV, Georges de Latour Private Reserve, Rutherford, California', 255),
          mi('PlumpJack, Estate, Oakville, Napa Valley, California', 275),
          mi('Cardinale, Napa Valley, California', 525),
          mi('Opus One, Napa Valley, California', 565)
        ]
      }
    ]
  }
];

/* ---- Flatten into a single indexed item list for the games ---- */
var MENU_ITEMS = (function () {
  var out = [];
  var counter = 0;
  MENU_SECTIONS.forEach(function (section) {
    section.categories.forEach(function (cat) {
      cat.items.forEach(function (item) {
        counter++;
        out.push(Object.assign({}, item, {
          id: 'itm' + counter,
          sectionId: section.id,
          sectionTitle: section.title,
          categoryTitle: cat.title
        }));
      });
    });
  });
  return out;
})();

function getItemsBySection(sectionId) {
  if (!sectionId || sectionId === 'all') return MENU_ITEMS.slice();
  return MENU_ITEMS.filter(function (i) { return i.sectionId === sectionId; });
}
