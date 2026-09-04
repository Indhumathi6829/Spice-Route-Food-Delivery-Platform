package com.spiceroute.delivery.config;

import com.spiceroute.delivery.entity.Category;
import com.spiceroute.delivery.entity.FoodItem;
import com.spiceroute.delivery.entity.SpicyLevel;
import com.spiceroute.delivery.repository.CategoryRepository;
import com.spiceroute.delivery.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@Order(2)   // runs after UserSeeder (Order 1)
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final FoodItemRepository foodItemRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }
        seedCategories();
        log.info("Database seeding complete.");
    }

    private void seedCategories() {
        // ── 1. Biryani ──────────────────────────────────────────────────────────
        Category biryani = save(category("Biryani", "Aromatic rice dishes", "🍚", 1));
        seedItems(biryani, List.of(
            item("Chicken Biryani",        "Classic Hyderabadi dum biryani with tender chicken",              319, 269, false, SpicyLevel.MEDIUM, 35, 650, true),
            item("Mutton Biryani",         "Slow-cooked mutton with fragrant basmati",                        399, 349, false, SpicyLevel.HOT,    45, 720, true),
            item("Veg Biryani",            "Fresh vegetables with saffron-infused rice",                      249, 199, true,  SpicyLevel.MILD,   25, 520, false),
            item("Paneer Biryani",         "Chargrilled paneer cubes layered with spiced rice",               299, 249, true,  SpicyLevel.MEDIUM, 30, 580, true),
            item("Prawn Biryani",          "Juicy prawns tossed in coastal masala and rice",                  379, 329, false, SpicyLevel.HOT,    40, 690, false),
            item("Egg Biryani",            "Boiled eggs cooked in zesty biryani gravy",                       259, 209, false, SpicyLevel.MEDIUM, 25, 530, false),
            item("Mushroom Biryani",       "Button mushrooms with aromatic whole spices",                     269, 219, true,  SpicyLevel.MILD,   25, 490, false),
            item("Fish Biryani",           "Marinated fish fillets with tangy biryani masala",                359, 309, false, SpicyLevel.HOT,    40, 660, false),
            item("Soya Biryani",           "Protein-rich soya chunks with herb-infused rice",                 239, null, true,  SpicyLevel.MILD,   20, 480, false),
            item("Thalassery Biryani",     "Kerala-style biryani with kaima rice and coconut",                349, 299, false, SpicyLevel.MEDIUM, 40, 640, false),
            item("Kolkata Biryani",        "Fragrant biryani with potato and boiled egg",                     329, 279, false, SpicyLevel.MILD,   35, 600, false),
            item("Ambur Biryani",          "Tangy tomato-based Ambur-style chicken biryani",                  309, 259, false, SpicyLevel.HOT,    35, 610, false),
            item("Chettinad Biryani",      "Spicy Chettinad spices with basmati rice",                        349, 299, false, SpicyLevel.EXTRA_HOT, 40, 680, false),
            item("Baby Corn Biryani",      "Tender baby corn with mint and coriander rice",                   259, 209, true,  SpicyLevel.MILD,   20, 470, false),
            item("Jackfruit Biryani",      "Raw jackfruit cooked in traditional dum style",                   279, 229, true,  SpicyLevel.MEDIUM, 30, 510, false),
            item("Nawabi Biryani",         "Royal-style biryani with dry fruits and kewra",                   429, 379, false, SpicyLevel.MILD,   50, 750, true),
            item("Chicken Tikka Biryani",  "Grilled tikka pieces layered in smoky biryani",                   349, 299, false, SpicyLevel.MEDIUM, 40, 670, true),
            item("Quail Biryani",          "Tender quail meat with Kerala roasted spices",                    399, null, false, SpicyLevel.HOT,    45, 700, false),
            item("Tofu Biryani",           "Crispy tofu with turmeric-spiced basmati",                        269, 219, true,  SpicyLevel.MILD,   20, 460, false),
            item("Double Chicken Biryani", "Extra chicken loaded dum biryani for big appetites",              449, 399, false, SpicyLevel.HOT,    45, 800, true)
        ));

        // ── 2. Burgers ──────────────────────────────────────────────────────────
        Category burgers = save(category("Burgers", "Juicy handcrafted burgers", "🍔", 2));
        seedItems(burgers, List.of(
            item("Classic Veg Burger",      "Crispy veggie patty with lettuce and cheese",                    149, 119, true,  SpicyLevel.MILD,   10, 380, false),
            item("Chicken Zinger Burger",   "Spicy fried chicken fillet with coleslaw",                       199, 169, false, SpicyLevel.HOT,    12, 450, true),
            item("BBQ Bacon Burger",        "Smoked bacon, cheddar and tangy BBQ sauce",                      279, 249, false, SpicyLevel.MILD,   12, 560, true),
            item("Paneer Tikka Burger",     "Grilled paneer with mint chutney and onion",                     189, 159, true,  SpicyLevel.MEDIUM, 10, 420, false),
            item("Double Patty Burger",     "Two beef patties with special house sauce",                      329, 299, false, SpicyLevel.MILD,   15, 680, true),
            item("Mushroom Swiss Burger",   "Sautéed mushrooms and Swiss cheese melt",                        249, 219, true,  SpicyLevel.MILD,   10, 440, false),
            item("Egg Burger",              "Fried egg with jalapeños and sriracha mayo",                     169, 139, false, SpicyLevel.MEDIUM, 10, 400, false),
            item("Spicy Habanero Burger",   "Habanero sauce chicken burger for heat lovers",                  229, 199, false, SpicyLevel.EXTRA_HOT, 12, 490, false),
            item("Fish Burger",             "Crispy battered fish fillet with tartare sauce",                 219, 189, false, SpicyLevel.MILD,   12, 430, false),
            item("Breakfast Burger",        "Hash brown, egg and cheese morning stack",                       199, 169, false, SpicyLevel.MILD,   10, 510, false),
            item("Avocado Burger",          "Fresh avocado, tomato and mozzarella",                           269, 239, true,  SpicyLevel.MILD,   10, 470, false),
            item("Tandoori Chicken Burger", "Chargrilled tandoori patty with mint yogurt",                    209, 179, false, SpicyLevel.MEDIUM, 12, 460, false),
            item("Black Bean Burger",       "Smoky black bean patty with guacamole",                          189, 159, true,  SpicyLevel.MILD,   10, 390, false),
            item("Peri Peri Burger",        "Flame-grilled chicken with peri peri glaze",                     219, 189, false, SpicyLevel.HOT,    12, 480, true),
            item("Truffle Mushroom Burger", "Wild mushrooms with truffle aioli on brioche",                   299, null, true,  SpicyLevel.MILD,   12, 500, false),
            item("Korean BBQ Burger",       "Gochujang glazed beef with kimchi slaw",                         289, 259, false, SpicyLevel.HOT,    15, 580, false),
            item("Pulled Pork Burger",      "Slow-cooked pulled pork with apple slaw",                        259, 229, false, SpicyLevel.MILD,   20, 540, false),
            item("Crispy Onion Burger",     "Stacked crispy onion rings with honey mustard",                  239, 209, true,  SpicyLevel.MILD,   10, 430, false),
            item("Smash Burger",            "Smashed beef patty with caramelized onions",                     279, 249, false, SpicyLevel.MILD,   12, 550, true),
            item("Tofu Burger",             "Pan-fried tofu with sesame ginger dressing",                     179, 149, true,  SpicyLevel.MILD,   10, 360, false)
        ));

        // ── 3. Pizza ────────────────────────────────────────────────────────────
        Category pizza = save(category("Pizza", "Freshly baked handcrafted pizzas", "🍕", 3));
        seedItems(pizza, List.of(
            item("Margherita",              "Classic tomato base with fresh mozzarella",                      249, 199, true,  SpicyLevel.MILD,   20, 620, false),
            item("Pepperoni",               "Loaded pepperoni on tangy tomato sauce",                         299, 249, false, SpicyLevel.MILD,   20, 750, true),
            item("BBQ Chicken",             "Smoked BBQ chicken with caramelized onions",                     349, 299, false, SpicyLevel.MILD,   20, 780, true),
            item("Veggie Supreme",          "Bell peppers, olives, mushrooms and corn",                       279, 229, true,  SpicyLevel.MILD,   20, 640, false),
            item("Spicy Paneer",            "Paneer tikka with green chilli and pepper",                      319, 269, true,  SpicyLevel.HOT,    20, 700, false),
            item("Four Cheese",             "Mozzarella, cheddar, parmesan and gouda",                        369, 319, true,  SpicyLevel.MILD,   20, 850, true),
            item("Meat Lovers",             "Chicken, bacon, pepperoni and sausage",                          399, 349, false, SpicyLevel.MILD,   25, 920, true),
            item("Hawaiian",                "Pineapple and ham on creamy white sauce",                        319, 269, false, SpicyLevel.MILD,   20, 680, false),
            item("Mushroom Truffle",        "Wild mushrooms drizzled with truffle oil",                       359, 309, true,  SpicyLevel.MILD,   20, 710, false),
            item("Peri Peri Chicken",       "Flame-grilled chicken with peri peri glaze",                     339, 289, false, SpicyLevel.HOT,    20, 760, false),
            item("Corn & Jalapeño",         "Sweet corn with pickled jalapeños and cheese",                   289, 239, true,  SpicyLevel.MEDIUM, 20, 650, false),
            item("Prawn & Garlic",          "Garlic butter prawns on cream cheese base",                      389, 339, false, SpicyLevel.MILD,   25, 790, false),
            item("Tandoori Paneer",         "Tandoori-spiced paneer with capsicum",                           329, 279, true,  SpicyLevel.MEDIUM, 20, 720, false),
            item("Double Chicken",          "Double chicken loaded with hot sauce",                           369, 319, false, SpicyLevel.HOT,    25, 840, false),
            item("Garden Fresh",            "Spinach, sun-dried tomato and artichoke",                        299, 249, true,  SpicyLevel.MILD,   20, 600, false),
            item("Chicken Tikka Pizza",     "Desi chicken tikka on naan-style base",                          349, 299, false, SpicyLevel.MEDIUM, 20, 770, true),
            item("Tex-Mex Pizza",           "Salsa, black beans, jalapeños and cheese",                       309, 259, true,  SpicyLevel.MEDIUM, 20, 660, false),
            item("Egg & Bacon",             "Scrambled egg and crispy bacon bites",                           339, 289, false, SpicyLevel.MILD,   20, 730, false),
            item("Soya Keema Pizza",        "Spiced soya mince with onion and pepper",                        279, 229, true,  SpicyLevel.MEDIUM, 20, 630, false),
            item("Volcano Pizza",           "Lava cheese centre with fiery hot sauce",                        399, null, false, SpicyLevel.EXTRA_HOT, 25, 900, true)
        ));

        // ── 4. South Indian ─────────────────────────────────────────────────────
        Category southIndian = save(category("South Indian", "Authentic south Indian cuisine", "🥘", 4));
        seedItems(southIndian, List.of(
            item("Masala Dosa",             "Crispy dosa with spiced potato filling",                         129,  99, true,  SpicyLevel.MEDIUM, 15, 350, true),
            item("Plain Dosa",              "Thin crispy dosa with coconut chutney",                           99,  79, true,  SpicyLevel.MILD,   10, 280, false),
            item("Rava Dosa",               "Crispy semolina dosa with onion and pepper",                     139, 109, true,  SpicyLevel.MEDIUM, 15, 320, false),
            item("Uttapam",                 "Thick rice pancake with tomato and onion",                        129,  99, true,  SpicyLevel.MEDIUM, 15, 360, false),
            item("Idli Sambar",             "Steamed rice cakes with piping hot sambar",                      119,  89, true,  SpicyLevel.MILD,   15, 290, false),
            item("Medu Vada",               "Crispy lentil fritters with sambar and chutney",                 109,  89, true,  SpicyLevel.MILD,   10, 310, false),
            item("Pongal",                  "Creamy rice-lentil porridge with ghee",                          119,  99, true,  SpicyLevel.MILD,   10, 380, false),
            item("Chettinad Chicken Curry", "Fiery Chettinad masala chicken gravy",                           269, 229, false, SpicyLevel.EXTRA_HOT, 30, 480, true),
            item("Kerala Fish Curry",       "Tangy raw-mango fish curry in coconut base",                     299, 249, false, SpicyLevel.HOT,    30, 450, false),
            item("Sambar Rice",             "Steamed rice mixed with flavourful sambar",                      149, 119, true,  SpicyLevel.MEDIUM, 15, 400, false),
            item("Curd Rice",               "Cooling curd rice with tempering and pomegranate",               119,  99, true,  SpicyLevel.MILD,   10, 320, false),
            item("Appam with Stew",         "Lacy rice hoppers with coconut vegetable stew",                  179, 149, true,  SpicyLevel.MILD,   20, 430, false),
            item("Pesarattu",               "Green moong dal crepes with ginger chutney",                     129,  99, true,  SpicyLevel.MILD,   15, 300, false),
            item("Chicken Chettinad Rice", "Chettinad chicken served with steamed rice",                     289, 249, false, SpicyLevel.HOT,    30, 520, false),
            item("Bisi Bele Bath",          "Karnataka one-pot rice with lentils and vegetables",             159, 129, true,  SpicyLevel.MEDIUM, 20, 410, false),
            item("Kothu Parotta",           "Shredded parotta tossed with egg and masala",                    199, 169, false, SpicyLevel.HOT,    20, 490, false),
            item("Vada Curry",              "Soft vada soaked in tangy onion-tomato curry",                   149, 119, true,  SpicyLevel.MEDIUM, 15, 360, false),
            item("Neer Dosa",               "Delicate thin rice dosa from coastal Karnataka",                 129,  99, true,  SpicyLevel.MILD,   10, 270, false),
            item("Ghee Pongal",             "Rich ghee-laden pongal with cashews",                            149, 119, true,  SpicyLevel.MILD,   10, 420, false),
            item("Chicken Parotta Set",     "Flaky layered parotta with spicy chicken salna",                 229, 199, false, SpicyLevel.HOT,    20, 560, true)
        ));

        // ── 5. Chinese ──────────────────────────────────────────────────────────
        Category chinese = save(category("Chinese", "Indo-Chinese street favourites", "🥡", 5));
        seedItems(chinese, List.of(
            item("Veg Fried Rice",          "Wok-tossed rice with veggies and soy sauce",                     179, 149, true,  SpicyLevel.MILD,   15, 420, false),
            item("Chicken Fried Rice",      "Classic egg and chicken wok fried rice",                         219, 189, false, SpicyLevel.MILD,   15, 490, true),
            item("Hakka Noodles",           "Stir-fried noodles with vegetables and sauces",                  189, 159, true,  SpicyLevel.MEDIUM, 15, 430, false),
            item("Chicken Hakka Noodles",   "Noodles tossed with shredded chicken",                           229, 199, false, SpicyLevel.MEDIUM, 15, 510, false),
            item("Gobi Manchurian",         "Crispy cauliflower in spicy Manchurian sauce",                   199, 169, true,  SpicyLevel.HOT,    15, 380, true),
            item("Chicken Manchurian",      "Deep-fried chicken in sweet-spicy Manchurian",                   249, 219, false, SpicyLevel.HOT,    15, 450, true),
            item("Chilli Paneer",           "Wok-tossed paneer with bell peppers and chilli",                 239, 209, true,  SpicyLevel.HOT,    15, 410, false),
            item("Spring Rolls",            "Crispy vegetable spring rolls with sweet chilli",                169, 139, true,  SpicyLevel.MILD,   10, 340, false),
            item("Schezwan Fried Rice",     "Fiery schezwan paste wok rice",                                  219, 189, true,  SpicyLevel.EXTRA_HOT, 15, 460, false),
            item("Dim Sum Basket",          "Steamed prawn and chicken dumplings",                            269, 239, false, SpicyLevel.MILD,   20, 380, false),
            item("Chilli Chicken",          "Tossed chicken with green chilli and garlic",                    259, 229, false, SpicyLevel.HOT,    15, 440, true),
            item("Hot & Sour Soup",         "Tangy soup with vegetables and egg drops",                       149, 119, false, SpicyLevel.HOT,    10, 180, false),
            item("Crispy Honey Chicken",    "Deep-fried chicken glazed with honey",                           269, 239, false, SpicyLevel.MILD,   15, 470, false),
            item("Kung Pao Tofu",           "Tofu with peanuts in kung pao sauce",                            219, 189, true,  SpicyLevel.HOT,    15, 390, false),
            item("Sesame Noodles",          "Cold noodles with sesame and peanut dressing",                   199, 169, true,  SpicyLevel.MILD,   10, 400, false),
            item("Prawn Fried Rice",        "Juicy prawns with egg and wok rice",                             279, 249, false, SpicyLevel.MILD,   15, 510, false),
            item("Wonton Soup",             "Delicate pork wontons in clear broth",                           179, 149, false, SpicyLevel.MILD,   15, 210, false),
            item("Mixed Fried Rice",        "Chicken, prawn and veg in one wok",                              259, 229, false, SpicyLevel.MEDIUM, 15, 530, false),
            item("Egg Fried Rice",          "Simple and satisfying egg wok rice",                             179, 149, false, SpicyLevel.MILD,   10, 400, false),
            item("Dragon Chicken",          "Crispy chicken in spicy dragon sauce",                           279, 249, false, SpicyLevel.EXTRA_HOT, 15, 480, false)
        ));

        // ── 6. Desserts ─────────────────────────────────────────────────────────
        Category desserts = save(category("Desserts", "Sweet indulgences and frozen treats", "🍨", 6));
        seedItems(desserts, List.of(
            item("Gulab Jamun",             "Soft milk-solid dumplings soaked in rose syrup",                  99,  79, true,  SpicyLevel.MILD,    5, 310, true),
            item("Rasgulla",               "Spongy cottage cheese balls in sugar syrup",                      99,  79, true,  SpicyLevel.MILD,    5, 280, false),
            item("Chocolate Lava Cake",    "Warm cake with molten dark chocolate centre",                    179, 149, true,  SpicyLevel.MILD,   15, 480, true),
            item("Kulfi",                  "Traditional Indian ice cream in pistachio",                      119,  99, true,  SpicyLevel.MILD,    5, 250, false),
            item("Rabri",                  "Thick condensed milk dessert with saffron",                      129, 109, true,  SpicyLevel.MILD,    5, 360, false),
            item("Mango Halwa",            "Seasonal mango cooked with ghee and sugar",                      149, 119, true,  SpicyLevel.MILD,   10, 390, false),
            item("Kheer",                  "Creamy rice pudding with cardamom and dry fruits",               119,  99, true,  SpicyLevel.MILD,    5, 340, false),
            item("Brownie Sundae",         "Warm brownie with vanilla ice cream",                            199, 169, true,  SpicyLevel.MILD,   10, 520, true),
            item("Panna Cotta",            "Italian cream dessert with berry coulis",                        159, 129, true,  SpicyLevel.MILD,   20, 290, false),
            item("Jalebi",                 "Crispy spirals soaked in sugar syrup",                            89,  69, true,  SpicyLevel.MILD,    5, 320, false),
            item("Tiramisu",               "Classic Italian espresso and mascarpone cake",                   199, 169, true,  SpicyLevel.MILD,   10, 430, false),
            item("Payasam",                "South Indian vermicelli pudding with jaggery",                   119,  99, true,  SpicyLevel.MILD,    5, 310, false),
            item("Cheesecake Slice",       "New York-style baked cheesecake",                                179, 149, true,  SpicyLevel.MILD,   10, 450, false),
            item("Churros",                "Spanish fried dough sticks with chocolate dip",                  169, 139, true,  SpicyLevel.MILD,   10, 410, false),
            item("Gajar Halwa",            "Slow-cooked carrot halwa with khoya",                            129, 109, true,  SpicyLevel.MILD,   10, 370, false),
            item("Coconut Ladoo",          "Freshly made coconut and condensed milk balls",                   99,  79, true,  SpicyLevel.MILD,    5, 220, false),
            item("Banana Foster",          "Caramelized banana with rum sauce and ice cream",               179, 149, true,  SpicyLevel.MILD,   10, 440, false),
            item("Sevai Kheer",            "Thin rice vermicelli cooked in sweetened milk",                  119,  99, true,  SpicyLevel.MILD,    5, 300, false),
            item("Mango Mousse",           "Light airy mango mousse with fresh mango topping",              149, 119, true,  SpicyLevel.MILD,   10, 260, false),
            item("Motichoor Ladoo",        "Classic gram flour ladoo with saffron",                           89,  69, true,  SpicyLevel.MILD,    5, 240, true)
        ));

        // ── 7. Drinks ───────────────────────────────────────────────────────────
        Category drinks = save(category("Drinks", "Refreshing beverages and juices", "🥤", 7));
        seedItems(drinks, List.of(
            item("Mango Lassi",            "Thick mango yogurt drink with cardamom",                         99,  79, true,  SpicyLevel.MILD,    5, 210, true),
            item("Classic Lemonade",       "Fresh-squeezed lemonade with mint",                              79,  59, true,  SpicyLevel.MILD,    5,  90, false),
            item("Masala Chai",            "Spiced Indian tea with ginger and milk",                          69,  49, true,  SpicyLevel.MILD,    5, 120, false),
            item("Cold Coffee",            "Blended iced coffee with cream",                                 119,  99, true,  SpicyLevel.MILD,    5, 180, true),
            item("Rose Sharbat",           "Chilled rose-flavoured milk drink",                               89,  69, true,  SpicyLevel.MILD,    5, 150, false),
            item("Green Apple Juice",      "Freshly pressed green apple juice",                               99,  79, true,  SpicyLevel.MILD,    5, 110, false),
            item("Watermelon Cooler",      "Fresh watermelon with lime and basil seeds",                      89,  69, true,  SpicyLevel.MILD,    5,  80, false),
            item("Tender Coconut Water",   "Straight from the shell coconut water",                           79,  59, true,  SpicyLevel.MILD,    5,  45, false),
            item("Strawberry Smoothie",    "Blended strawberry with yogurt and honey",                       119,  99, true,  SpicyLevel.MILD,    5, 190, false),
            item("Badam Milk",             "Chilled almond-saffron flavoured milk",                          109,  89, true,  SpicyLevel.MILD,    5, 200, false),
            item("Jaljeera",               "Tangy cumin and mint chilled drink",                              69,  49, true,  SpicyLevel.MILD,    5,  60, false),
            item("Pomegranate Juice",      "Freshly pressed pomegranate",                                    109,  89, true,  SpicyLevel.MILD,    5, 130, false),
            item("Pineapple Punch",        "Pineapple juice with lime and chaat masala",                      89,  69, true,  SpicyLevel.MILD,    5, 100, false),
            item("Chocolate Milkshake",    "Rich chocolate shake with vanilla ice cream",                    139, 119, true,  SpicyLevel.MILD,    5, 310, true),
            item("Aam Panna",              "Raw mango summer cooler with black salt",                         79,  59, true,  SpicyLevel.MILD,    5,  70, false),
            item("Blue Lagoon",            "Blue curacao syrup with lemon soda",                              99,  79, true,  SpicyLevel.MILD,    5,  80, false),
            item("Avocado Smoothie",       "Creamy avocado blended with banana and milk",                    129, 109, true,  SpicyLevel.MILD,    5, 240, false),
            item("Thandai",                "Chilled milk with mixed nuts and spices",                        109,  89, true,  SpicyLevel.MILD,    5, 220, false),
            item("Nannari Sharbat",        "Traditional sarsaparilla root cooler",                            79,  59, true,  SpicyLevel.MILD,    5,  65, false),
            item("Virgin Mojito",          "Lime, mint and soda mocktail",                                    89,  69, true,  SpicyLevel.MILD,    5,  55, false)
        ));

        // ── 8. Starters ─────────────────────────────────────────────────────────
        Category starters = save(category("Starters", "Lip-smacking appetisers", "🥗", 8));
        seedItems(starters, List.of(
            item("Chicken 65",             "Spicy deep-fried chicken with curry leaves",                     219, 189, false, SpicyLevel.HOT,    15, 380, true),
            item("Paneer Tikka",           "Marinated paneer grilled in tandoor",                            229, 199, true,  SpicyLevel.MEDIUM, 20, 360, true),
            item("Veg Seekh Kebab",        "Spiced mixed vegetable skewers",                                 199, 169, true,  SpicyLevel.MEDIUM, 15, 310, false),
            item("Chicken Tikka",          "Boneless chicken marinated in yogurt and spices",               249, 219, false, SpicyLevel.MEDIUM, 20, 400, true),
            item("Fish Amritsari",         "Crispy battered fish fillets with chutney",                     259, 229, false, SpicyLevel.MEDIUM, 15, 370, false),
            item("Onion Bhaji",            "Crispy onion fritters with mint chutney",                        149, 119, true,  SpicyLevel.MEDIUM, 10, 290, false),
            item("Aloo Tikki",             "Golden potato cakes with tamarind chutney",                     139, 109, true,  SpicyLevel.MILD,   10, 270, false),
            item("Prawn Koliwada",         "Spiced coastal-style crispy fried prawns",                      279, 249, false, SpicyLevel.HOT,    15, 350, false),
            item("Hara Bhara Kabab",       "Spinach and pea patties with mint dip",                         179, 149, true,  SpicyLevel.MILD,   15, 260, false),
            item("Chicken Wings",          "Crispy glazed wings with hot sauce",                            239, 209, false, SpicyLevel.HOT,    15, 420, true),
            item("Veg Lollipop",           "Cauliflower lollipops in Manchurian sauce",                     189, 159, true,  SpicyLevel.HOT,    15, 300, false),
            item("Dahi Kebab",             "Hung curd patties with walnut and raisins",                     199, 169, true,  SpicyLevel.MILD,   15, 320, false),
            item("Stuffed Mushrooms",      "Button mushrooms stuffed with cheese and herbs",                189, 159, true,  SpicyLevel.MILD,   15, 280, false),
            item("Reshmi Tikka",           "Creamy cashew-based chicken tikka",                             259, 229, false, SpicyLevel.MILD,   20, 410, false),
            item("Nachos with Salsa",      "Corn tortilla chips with tomato salsa",                         169, 139, true,  SpicyLevel.MEDIUM, 10, 350, false),
            item("Crispy Corn",            "Batter-fried sweet corn kernels with spices",                   149, 119, true,  SpicyLevel.MEDIUM, 10, 280, false),
            item("Mutton Seekh Kebab",     "Minced mutton kebab cooked in clay oven",                       279, 249, false, SpicyLevel.HOT,    20, 430, true),
            item("Samosa",                 "Crispy pastry filled with spiced potato and peas",               99,  79, true,  SpicyLevel.MILD,   10, 220, false),
            item("Bruschetta",             "Toasted bread with tomato and fresh basil",                     159, 129, true,  SpicyLevel.MILD,   10, 230, false),
            item("Chilli Baby Corn",       "Wok-tossed baby corn in spicy chilli sauce",                   179, 149, true,  SpicyLevel.HOT,    15, 290, false)
        ));

        // ── 9. North Indian ─────────────────────────────────────────────────────
        Category northIndian = save(category("North Indian", "Rich Mughal-inspired curries and breads", "🫓", 9));
        seedItems(northIndian, List.of(
            item("Butter Chicken",          "Creamy tomato-butter gravy with tender chicken",                319, 279, false, SpicyLevel.MILD,   25, 560, true),
            item("Dal Makhani",             "Black lentils slow-cooked overnight in butter",                 249, 209, true,  SpicyLevel.MILD,   20, 450, true),
            item("Paneer Butter Masala",    "Paneer in rich tomato-cashew gravy",                            289, 249, true,  SpicyLevel.MILD,   20, 500, true),
            item("Chicken Rogan Josh",      "Kashmiri slow-cooked lamb with whole spices",                   349, 309, false, SpicyLevel.HOT,    35, 580, false),
            item("Palak Paneer",            "Cottage cheese in smooth spiced spinach curry",                 269, 229, true,  SpicyLevel.MEDIUM, 20, 430, false),
            item("Chole Bhature",           "Spiced chickpeas with fluffy fried bread",                      219, 179, true,  SpicyLevel.MEDIUM, 20, 620, true),
            item("Rajma Chawal",            "Kidney bean curry with steamed basmati rice",                   219, 189, true,  SpicyLevel.MEDIUM, 20, 520, false),
            item("Kadai Chicken",           "Wok-cooked chicken with peppers and masala",                    309, 269, false, SpicyLevel.HOT,    25, 540, false),
            item("Aloo Gobi",               "Dry potato and cauliflower with turmeric",                      199, 169, true,  SpicyLevel.MILD,   20, 360, false),
            item("Mutton Korma",            "Tender mutton braised in yogurt and almond gravy",              379, 339, false, SpicyLevel.MILD,   40, 650, false),
            item("Garlic Naan",             "Soft leavened bread topped with garlic butter",                  59,  49, true,  SpicyLevel.MILD,   10, 240, false),
            item("Stuffed Paratha",         "Whole wheat flatbread stuffed with spiced potato",              129,  99, true,  SpicyLevel.MILD,   15, 380, false),
            item("Shahi Paneer",            "Paneer in royal cream and cashew curry",                        299, 259, true,  SpicyLevel.MILD,   20, 540, false),
            item("Lamb Biryani Curry",      "Slow-cooked lamb in fragrant biryani sauce",                   369, 329, false, SpicyLevel.MEDIUM, 40, 620, false),
            item("Matar Paneer",            "Peas and paneer in tangy tomato gravy",                         259, 219, true,  SpicyLevel.MEDIUM, 20, 460, false),
            item("Sarson da Saag",          "Punjabi mustard greens with makki roti",                        239, 199, true,  SpicyLevel.MEDIUM, 25, 390, false),
            item("Chicken Saag",            "Chicken in vibrant spiced spinach curry",                       309, 269, false, SpicyLevel.MEDIUM, 25, 510, false),
            item("Pindi Chhole",            "Dry-style spicy chickpeas with amchur",                         219, 179, true,  SpicyLevel.HOT,    20, 420, false),
            item("Dal Tadka",               "Yellow lentils tempered with cumin and garlic",                 199, 169, true,  SpicyLevel.MILD,   15, 380, false),
            item("Lasuni Palak",            "Garlic-infused spinach in mild spices",                         219, 189, true,  SpicyLevel.MILD,   20, 350, false)
        ));

        // ── 10. Rolls & Wraps ───────────────────────────────────────────────────
        Category rolls = save(category("Rolls & Wraps", "Handy wraps and Kathi rolls", "🌯", 10));
        seedItems(rolls, List.of(
            item("Chicken Kathi Roll",      "Egg-coated paratha with spiced chicken filling",               199, 169, false, SpicyLevel.MEDIUM, 15, 480, true),
            item("Paneer Kathi Roll",       "Grilled paneer with onion and chutney in paratha",             179, 149, true,  SpicyLevel.MEDIUM, 15, 440, false),
            item("Egg Roll",                "Classic Kolkata-style egg roll with mustard",                  149, 119, false, SpicyLevel.MILD,   10, 390, false),
            item("Veg Frankie",             "Mixed vegetable masala wrapped in soft roti",                  159, 129, true,  SpicyLevel.MILD,   10, 360, false),
            item("Chicken Shawarma",        "Lebanese-spiced chicken with garlic sauce",                    199, 169, false, SpicyLevel.MEDIUM, 10, 470, true),
            item("Falafel Wrap",            "Crispy falafel with hummus and tabouleh",                      179, 149, true,  SpicyLevel.MILD,   10, 400, false),
            item("Lamb Shawarma",           "Slow-roasted lamb with tahini wrap",                           229, 199, false, SpicyLevel.MEDIUM, 10, 520, false),
            item("Fish Taco Wrap",          "Crispy fish with avocado and chipotle",                        219, 189, false, SpicyLevel.MEDIUM, 12, 450, false),
            item("Burrito Bowl",            "Mexican rice bowl with beans, salsa and cheese",               239, 209, true,  SpicyLevel.MEDIUM, 15, 530, false),
            item("Chicken Caesar Wrap",     "Grilled chicken with Caesar dressing in tortilla",             199, 169, false, SpicyLevel.MILD,   10, 460, false),
            item("Soya Tikka Roll",         "Soya chunks tikka wrapped in mint paratha",                    169, 139, true,  SpicyLevel.MEDIUM, 15, 380, false),
            item("Club Sandwich Roll",      "Layered chicken, egg and cheese in a roll",                    219, 189, false, SpicyLevel.MILD,   10, 490, false),
            item("Prawn Wrap",              "Spicy masala prawns with lettuce and mayo",                    229, 199, false, SpicyLevel.HOT,    12, 430, false),
            item("Mushroom Tikka Wrap",     "Char-grilled mushrooms with tzatziki",                         179, 149, true,  SpicyLevel.MILD,   10, 360, false),
            item("Masala Omelette Roll",    "Spiced omelette rolled in soft paratha",                       149, 119, false, SpicyLevel.MEDIUM, 10, 370, false),
            item("BBQ Chicken Wrap",        "Smoked BBQ chicken with coleslaw",                             209, 179, false, SpicyLevel.MILD,   10, 500, false),
            item("Tofu Tikka Wrap",         "Marinated tofu with bell pepper and chutney",                  169, 139, true,  SpicyLevel.MEDIUM, 10, 350, false),
            item("Keema Paratha Roll",      "Spiced minced meat wrapped in crispy paratha",                 219, 189, false, SpicyLevel.HOT,    15, 510, false),
            item("Aloo Matar Frankie",      "Potato and peas filling in a Mumbai-style frankie",            149, 119, true,  SpicyLevel.MILD,   10, 340, false),
            item("Pulled Chicken Wrap",     "Slow-cooked shredded chicken with salsa",                     209, 179, false, SpicyLevel.MEDIUM, 15, 480, false)
        ));

        // ── 11. Pasta ───────────────────────────────────────────────────────────
        Category pasta = save(category("Pasta", "Italian-style pasta dishes", "🍝", 11));
        seedItems(pasta, List.of(
            item("Penne Arrabbiata",        "Penne in spicy tomato garlic sauce",                            249, 209, true,  SpicyLevel.HOT,    20, 520, false),
            item("Pasta Alfredo",           "Fettuccine in creamy parmesan sauce",                           279, 239, true,  SpicyLevel.MILD,   20, 620, true),
            item("Spaghetti Bolognese",     "Classic minced meat in slow-cooked tomato sauce",               319, 279, false, SpicyLevel.MILD,   25, 680, true),
            item("Pesto Pasta",             "Basil pesto with cherry tomatoes and pine nuts",                259, 219, true,  SpicyLevel.MILD,   20, 550, false),
            item("Mac & Cheese",            "Creamy four-cheese baked macaroni",                             249, 209, true,  SpicyLevel.MILD,   20, 640, true),
            item("Pasta Primavera",         "Spring vegetables in light olive oil sauce",                   249, 209, true,  SpicyLevel.MILD,   20, 480, false),
            item("Chicken Carbonara",       "Creamy egg and bacon sauce with chicken",                       309, 269, false, SpicyLevel.MILD,   20, 700, false),
            item("Mushroom Pasta",          "Wild mushrooms in garlic butter cream sauce",                   269, 229, true,  SpicyLevel.MILD,   20, 560, false),
            item("Prawn Linguine",          "Juicy prawns with garlic, chilli and lemon",                   329, 289, false, SpicyLevel.MEDIUM, 20, 590, false),
            item("Lasagna",                 "Layered baked pasta with meat sauce and bechamel",              349, 309, false, SpicyLevel.MILD,   30, 780, true),
            item("Vegetable Lasagna",       "Layered zucchini, peppers and ricotta",                         319, 279, true,  SpicyLevel.MILD,   30, 640, false),
            item("Spicy Chicken Pasta",     "Chicken in hot arrabiata with olives",                          299, 259, false, SpicyLevel.HOT,    20, 660, false),
            item("Cacio e Pepe",            "Roman-style pasta with pepper and pecorino",                   259, 219, true,  SpicyLevel.MEDIUM, 15, 510, false),
            item("Baked Ziti",              "Ziti pasta baked with mozzarella and marinara",                 299, 259, true,  SpicyLevel.MILD,   30, 690, false),
            item("Tagliatelle Bolognese",   "Egg tagliatelle with rich ragu sauce",                          329, 289, false, SpicyLevel.MILD,   25, 710, false),
            item("Pumpkin Ravioli",         "Pumpkin-stuffed pasta with sage butter",                        299, 259, true,  SpicyLevel.MILD,   25, 540, false),
            item("Pasta e Fagioli",         "Pasta with borlotti beans in tomato broth",                    239, 199, true,  SpicyLevel.MILD,   20, 490, false),
            item("Aglio Olio",              "Spaghetti with garlic, olive oil and chilli",                  229, 199, true,  SpicyLevel.MEDIUM, 15, 480, false),
            item("Chicken Pesto Pasta",     "Grilled chicken with creamy basil pesto",                      309, 269, false, SpicyLevel.MILD,   20, 640, false),
            item("Orzo Salad Pasta",        "Cold orzo with roasted veg and feta",                           239, 199, true,  SpicyLevel.MILD,   15, 430, false)
        ));

        // ── 12. Salads ──────────────────────────────────────────────────────────
        Category salads = save(category("Salads", "Fresh and healthy salads", "🥙", 12));
        seedItems(salads, List.of(
            item("Caesar Salad",            "Romaine, croutons, parmesan and Caesar dressing",              199, 169, true,  SpicyLevel.MILD,   10, 280, true),
            item("Greek Salad",             "Tomato, cucumber, olives, feta and oregano",                   189, 159, true,  SpicyLevel.MILD,   10, 240, false),
            item("Grilled Chicken Salad",   "Char-grilled chicken with mixed greens",                       229, 199, false, SpicyLevel.MILD,   15, 320, false),
            item("Quinoa Power Bowl",       "Quinoa with avocado, edamame and lemon",                        249, 219, true,  SpicyLevel.MILD,   10, 380, false),
            item("Watermelon Feta Salad",   "Chilled watermelon with mint and feta",                        179, 149, true,  SpicyLevel.MILD,    5, 190, false),
            item("Kachumber Salad",         "Indian diced cucumber, tomato and onion",                      129,  99, true,  SpicyLevel.MILD,    5, 120, false),
            item("Nicoise Salad",           "French salad with tuna, beans and olives",                     239, 209, false, SpicyLevel.MILD,   10, 350, false),
            item("Caprese Salad",           "Fresh mozzarella, tomato and basil drizzle",                   199, 169, true,  SpicyLevel.MILD,    5, 260, false),
            item("Thai Mango Salad",        "Raw mango with peanuts and sweet chilli dressing",             189, 159, true,  SpicyLevel.MEDIUM, 10, 210, false),
            item("Coleslaw",                "Creamy shredded cabbage and carrot slaw",                      139, 109, true,  SpicyLevel.MILD,    5, 180, false),
            item("Panzanella",              "Tuscan bread and tomato salad with basil",                     179, 149, true,  SpicyLevel.MILD,   10, 230, false),
            item("Warm Roasted Veg Salad",  "Roasted seasonal veggies with tahini drizzle",                 199, 169, true,  SpicyLevel.MILD,   15, 290, false),
            item("Prawn Avocado Salad",     "Chilled prawns with avocado and citrus",                       249, 219, false, SpicyLevel.MILD,   10, 310, false),
            item("Sprouted Moong Salad",    "Fresh sprouts with lemon and chaat masala",                    149, 119, true,  SpicyLevel.MILD,    5, 160, false),
            item("Pomelo Salad",            "South-East Asian pomelo with coconut and peanuts",             179, 149, true,  SpicyLevel.MILD,   10, 200, false),
            item("Grilled Halloumi Salad",  "Grilled halloumi with spinach and pomegranate",               219, 189, true,  SpicyLevel.MILD,   15, 300, false),
            item("Mexican Corn Salad",      "Charred corn with chipotle mayo and cotija",                   189, 159, true,  SpicyLevel.MEDIUM, 10, 270, false),
            item("Fattoush",                "Lebanese salad with toasted pita and sumac",                   179, 149, true,  SpicyLevel.MILD,   10, 220, false),
            item("Chickpea Spinach Salad",  "Roasted chickpeas with spinach and lemon",                     179, 149, true,  SpicyLevel.MILD,   10, 260, false),
            item("Detox Green Salad",       "Kale, cucumber, avocado with ginger dressing",                 199, 169, true,  SpicyLevel.MILD,   10, 200, false)
        ));

        // ── 13. Sandwiches ──────────────────────────────────────────────────────
        Category sandwiches = save(category("Sandwiches", "Grilled and stacked sandwiches", "🥪", 13));
        seedItems(sandwiches, List.of(
            item("Classic Club Sandwich",   "Triple-decker chicken, egg and cheese",                        219, 189, false, SpicyLevel.MILD,   10, 490, true),
            item("Grilled Cheese",          "Buttery toasted sandwich with melted cheddar",                 149, 119, true,  SpicyLevel.MILD,    8, 380, false),
            item("BLT Sandwich",            "Bacon, lettuce and tomato on sourdough",                       199, 169, false, SpicyLevel.MILD,   10, 430, false),
            item("Chicken Tikka Sandwich",  "Grilled tikka chicken with mint mayo",                         199, 169, false, SpicyLevel.MEDIUM, 10, 450, false),
            item("Veg Club Sandwich",       "Layered veggies with cheese and mustard",                      179, 149, true,  SpicyLevel.MILD,   10, 380, false),
            item("Tuna Melt",               "Tuna with melted cheese on toasted bread",                     219, 189, false, SpicyLevel.MILD,   10, 460, false),
            item("Panini Caprese",          "Mozzarella, tomato and pesto panini",                          199, 169, true,  SpicyLevel.MILD,   10, 400, false),
            item("Egg Salad Sandwich",      "Creamy egg salad on soft white bread",                         169, 139, false, SpicyLevel.MILD,    8, 370, false),
            item("Pulled Pork Sub",         "Slow-cooked pork with pickles on hoagie roll",                 249, 219, false, SpicyLevel.MILD,   15, 540, false),
            item("Avocado Toast Sandwich",  "Smashed avocado on multigrain with feta",                      199, 169, true,  SpicyLevel.MILD,    8, 360, false),
            item("Bombay Toast",            "Indian spiced bread toast with vegetables",                    149, 119, true,  SpicyLevel.MEDIUM, 10, 320, false),
            item("Chicken Caesar Sub",      "Caesar chicken in a crusty sub roll",                          219, 189, false, SpicyLevel.MILD,   10, 480, false),
            item("Meatball Sub",            "Juicy meatballs in marinara on a hoagie",                      249, 219, false, SpicyLevel.MILD,   15, 560, false),
            item("Mushroom Swiss Panini",   "Sautéed mushrooms with Swiss cheese",                          189, 159, true,  SpicyLevel.MILD,   10, 390, false),
            item("Shawarma Sandwich",       "Shawarma chicken stuffed in pita",                             199, 169, false, SpicyLevel.MEDIUM, 10, 470, false),
            item("Grilled Veggie Sub",      "Roasted bell peppers and zucchini sub",                        179, 149, true,  SpicyLevel.MILD,   10, 350, false),
            item("Bacon Egg Sandwich",      "Crispy bacon with fried egg and mustard",                      189, 159, false, SpicyLevel.MILD,    8, 440, false),
            item("Corned Beef Reuben",      "Corned beef, sauerkraut and Swiss on rye",                     239, 209, false, SpicyLevel.MILD,   10, 520, false),
            item("Chilli Cheese Toast",     "Open toast with jalapeños and melted cheese",                  169, 139, true,  SpicyLevel.HOT,    8, 370, false),
            item("Pesto Veggie Panini",     "Grilled vegetables with basil pesto panini",                   189, 159, true,  SpicyLevel.MILD,   10, 360, false)
        ));

        // ── 14. Soups ───────────────────────────────────────────────────────────
        Category soups = save(category("Soups", "Comforting soups and broths", "🍲", 14));
        seedItems(soups, List.of(
            item("Tomato Basil Soup",       "Roasted tomato soup with fresh basil cream",                   149, 119, true,  SpicyLevel.MILD,   10, 180, true),
            item("Chicken Noodle Soup",     "Clear chicken broth with noodles and veggies",                 179, 149, false, SpicyLevel.MILD,   15, 220, false),
            item("Lentil Soup",             "Hearty red lentil soup with cumin",                            149, 119, true,  SpicyLevel.MILD,   15, 260, false),
            item("Mushroom Cream Soup",     "Creamy wild mushroom bisque with truffle",                     169, 139, true,  SpicyLevel.MILD,   15, 230, false),
            item("Mulligatawny",            "Spiced lentil soup with rice and apple",                       159, 129, true,  SpicyLevel.MEDIUM, 15, 250, false),
            item("Tom Kha Gai",             "Thai coconut milk soup with chicken",                          189, 159, false, SpicyLevel.MEDIUM, 15, 280, false),
            item("Minestrone",              "Italian vegetable and pasta soup",                             149, 119, true,  SpicyLevel.MILD,   15, 210, false),
            item("Pumpkin Soup",            "Roasted pumpkin and ginger velvety soup",                      159, 129, true,  SpicyLevel.MILD,   15, 200, false),
            item("French Onion Soup",       "Caramelized onion soup with gruyere toast",                    169, 139, true,  SpicyLevel.MILD,   20, 290, false),
            item("Rasam",                   "South Indian tangy pepper broth",                              109,  89, true,  SpicyLevel.HOT,    10, 80,  false),
            item("Corn Chowder",            "Creamy sweet corn soup with bacon bits",                       169, 139, false, SpicyLevel.MILD,   15, 310, false),
            item("Thai Tom Yum",            "Spicy lemongrass prawn soup",                                  199, 169, false, SpicyLevel.HOT,    15, 190, false),
            item("Palak Shorba",            "Silky Indian spinach broth with cream",                        139, 109, true,  SpicyLevel.MILD,   10, 160, false),
            item("Clam Chowder",            "New England style creamy clam soup",                           199, 169, false, SpicyLevel.MILD,   20, 340, false),
            item("Roasted Carrot Soup",     "Honey-roasted carrot with ginger",                             149, 119, true,  SpicyLevel.MILD,   15, 190, false),
            item("Miso Soup",               "Japanese miso with tofu and wakame",                           129,  99, true,  SpicyLevel.MILD,   10, 90,  false),
            item("Sweet Corn Soup",         "Indo-Chinese style sweet corn with egg",                       149, 119, false, SpicyLevel.MILD,   10, 170, false),
            item("Gazpacho",                "Cold Spanish tomato and pepper soup",                          149, 119, true,  SpicyLevel.MILD,    5, 130, false),
            item("Mutton Soup",             "Bone broth mutton soup with peppercorns",                      199, 169, false, SpicyLevel.HOT,    30, 270, false),
            item("Cauliflower Soup",        "Roasted cauliflower with cheddar cream",                       149, 119, true,  SpicyLevel.MILD,   15, 200, false)
        ));

        // ── 15. Street Food ─────────────────────────────────────────────────────
        Category streetFood = save(category("Street Food", "Indian street food favourites", "🌮", 15));
        seedItems(streetFood, List.of(
            item("Pani Puri",               "Crispy puris filled with spiced tamarind water",                99,  79, true,  SpicyLevel.MEDIUM, 10, 180, true),
            item("Bhel Puri",               "Puffed rice with tamarind chutney and sev",                    109,  89, true,  SpicyLevel.MEDIUM, 10, 200, true),
            item("Sev Puri",                "Flat puris topped with potato, onion and chutneys",            109,  89, true,  SpicyLevel.MEDIUM, 10, 210, false),
            item("Dahi Puri",               "Puris filled with yogurt and sweet chutney",                   119,  99, true,  SpicyLevel.MILD,   10, 230, false),
            item("Vada Pav",                "Mumbai's famous potato fritter in a bun",                       89,  69, true,  SpicyLevel.MEDIUM, 10, 290, true),
            item("Pav Bhaji",               "Buttery mashed vegetable curry with pav",                      159, 129, true,  SpicyLevel.MEDIUM, 15, 420, true),
            item("Dabeli",                  "Spiced potato filling in pav with peanuts",                    109,  89, true,  SpicyLevel.MILD,   10, 310, false),
            item("Kachori Sabzi",           "Flaky kachori with spiced potato gravy",                       139, 109, true,  SpicyLevel.MEDIUM, 15, 380, false),
            item("Egg Puff",                "Flaky pastry puff with spiced egg filling",                    109,  89, false, SpicyLevel.MEDIUM, 10, 270, false),
            item("Misal Pav",               "Spicy sprout curry with crunchy farsan and pav",               149, 119, true,  SpicyLevel.HOT,    15, 400, false),
            item("Frankies",                "Street-style masala roll with egg and veggies",                139, 109, false, SpicyLevel.MEDIUM, 10, 360, false),
            item("Bread Pakora",            "Bread stuffed with potato and batter-fried",                   119,  99, true,  SpicyLevel.MILD,   10, 310, false),
            item("Aloo Chaat",              "Crispy potato cubes with chaat masala",                        129,  99, true,  SpicyLevel.MEDIUM, 10, 280, false),
            item("Churmur",                 "Crushed puri chaat with tamarind and onion",                   109,  89, true,  SpicyLevel.MEDIUM, 10, 240, false),
            item("Chole Kulche",            "Spiced chickpeas with soft kulche bread",                      169, 139, true,  SpicyLevel.MEDIUM, 15, 450, false),
            item("Papdi Chaat",             "Crispy wafers with yogurt and chutneys",                       129,  99, true,  SpicyLevel.MEDIUM, 10, 260, false),
            item("Raj Kachori",             "Giant kachori filled with sprouts and yogurt",                 149, 119, true,  SpicyLevel.MEDIUM, 15, 340, false),
            item("Dahi Vada",               "Soft vada soaked in chilled yogurt",                           129,  99, true,  SpicyLevel.MILD,   10, 290, false),
            item("Tawa Pulao",              "Spicy pav bhaji masala rice from the tawa",                    159, 129, true,  SpicyLevel.HOT,    15, 410, false),
            item("Corn Chaat",              "Boiled corn kernels with lime and masala",                      99,  79, true,  SpicyLevel.MEDIUM,  5, 190, false)
        ));

        // ── 16. Healthy Bowls ───────────────────────────────────────────────────
        Category healthyBowls = save(category("Healthy Bowls", "Nutritious power bowls", "🥣", 16));
        seedItems(healthyBowls, List.of(
            item("Acai Bowl",               "Frozen acai blend with granola and berries",                   249, 219, true,  SpicyLevel.MILD,   10, 320, true),
            item("Buddha Bowl",             "Roasted veg, chickpeas and tahini on quinoa",                  259, 229, true,  SpicyLevel.MILD,   15, 400, false),
            item("Teriyaki Chicken Bowl",   "Grilled teriyaki chicken on steamed rice",                     289, 259, false, SpicyLevel.MILD,   20, 520, true),
            item("Tofu Poke Bowl",          "Hawaiian poke with tofu and mango salsa",                      259, 229, true,  SpicyLevel.MILD,   15, 390, false),
            item("Salmon Poke Bowl",        "Fresh salmon with edamame and cucumber",                       329, 299, false, SpicyLevel.MILD,   10, 460, true),
            item("Grain Bowl",              "Farro, roasted sweet potato and kale",                         239, 209, true,  SpicyLevel.MILD,   15, 370, false),
            item("Smoothie Bowl",           "Blended mango and berries with toppings",                      219, 189, true,  SpicyLevel.MILD,   10, 290, false),
            item("Greek Protein Bowl",      "Chicken, tzatziki, hummus and pita chips",                     279, 249, false, SpicyLevel.MILD,   15, 490, false),
            item("Bibimbap Bowl",           "Korean mixed rice with vegetables and egg",                    269, 239, false, SpicyLevel.MEDIUM, 20, 510, false),
            item("Overnight Oats Bowl",     "Soaked oats with chia, banana and honey",                      199, 169, true,  SpicyLevel.MILD,    5, 350, false),
            item("Lentil Dal Bowl",         "Protein-rich red lentil dal with brown rice",                  219, 189, true,  SpicyLevel.MILD,   20, 420, false),
            item("Green Goddess Bowl",      "Avocado, broccoli, spinach and hemp seeds",                    249, 219, true,  SpicyLevel.MILD,   15, 330, false),
            item("Mexican Bowl",            "Black beans, rice, salsa and guacamole",                       239, 209, true,  SpicyLevel.MEDIUM, 15, 440, false),
            item("Turmeric Cauliflower Bowl","Roasted cauliflower with turmeric tahini",                     229, 199, true,  SpicyLevel.MILD,   20, 310, false),
            item("Tuna Poke Bowl",          "Ahi tuna with seaweed salad and sesame",                        309, 279, false, SpicyLevel.MILD,   10, 410, false),
            item("Breakfast Oat Bowl",      "Warm oatmeal with fruits and nut butter",                      179, 149, true,  SpicyLevel.MILD,   10, 380, false),
            item("Edamame Rice Bowl",       "Steamed edamame over jasmine rice with miso",                  229, 199, true,  SpicyLevel.MILD,   15, 390, false),
            item("Paneer Protein Bowl",     "Grilled paneer with chickpeas and greens",                     259, 229, true,  SpicyLevel.MEDIUM, 15, 450, false),
            item("Shrimp Taco Bowl",        "Cajun shrimp over rice with corn salsa",                        299, 269, false, SpicyLevel.MEDIUM, 15, 480, false),
            item("Immunity Boost Bowl",     "Turmeric, ginger, greens and millet",                           229, 199, true,  SpicyLevel.MILD,   15, 300, false)
        ));

        // ── 17. Seafood ─────────────────────────────────────────────────────────
        Category seafood = save(category("Seafood", "Fresh catch from land and sea", "🦞", 17));
        seedItems(seafood, List.of(
            item("Prawn Masala",            "Juicy prawns in spicy onion-tomato gravy",                     319, 279, false, SpicyLevel.HOT,    20, 420, true),
            item("Fish Fry",                "Crispy spiced fish fillet with lemon wedge",                   279, 249, false, SpicyLevel.MEDIUM, 15, 380, true),
            item("Lobster Thermidor",       "Lobster in creamy mustard sauce gratin",                       799, 699, false, SpicyLevel.MILD,   35, 540, false),
            item("Garlic Butter Prawns",    "Jumbo prawns sautéed in garlic herb butter",                   349, 309, false, SpicyLevel.MILD,   15, 400, false),
            item("Fish Curry",              "Coastal-style fish in coconut and tamarind",                   299, 259, false, SpicyLevel.HOT,    25, 410, false),
            item("Grilled Salmon",          "Atlantic salmon with lemon butter and capers",                 449, 399, false, SpicyLevel.MILD,   20, 480, true),
            item("Calamari Fry",            "Crispy battered squid rings with aioli",                       269, 239, false, SpicyLevel.MILD,   15, 360, false),
            item("Crab Masala",             "Fresh crab cooked in spicy Mangalorean masala",               549, 499, false, SpicyLevel.HOT,    40, 390, false),
            item("Prawn Biryani",           "Flavourful prawn dum biryani",                                  379, 339, false, SpicyLevel.HOT,    35, 620, false),
            item("Fish Tacos",              "Battered fish with slaw and chipotle",                          279, 249, false, SpicyLevel.MEDIUM, 15, 450, false),
            item("Stuffed Crab",            "Baked crab shell stuffed with crab meat",                      499, 449, false, SpicyLevel.MEDIUM, 30, 370, false),
            item("Mussels in Wine",         "Steamed mussels in white wine and herbs",                      349, 309, false, SpicyLevel.MILD,   20, 290, false),
            item("Tandoori Fish",           "Clay-oven roasted spiced fish tikka",                           329, 289, false, SpicyLevel.MEDIUM, 25, 380, false),
            item("Scallops Sizzler",        "Pan-seared scallops with butter and herbs",                    499, 449, false, SpicyLevel.MILD,   20, 340, false),
            item("Prawn Cocktail",          "Chilled prawns with Mary Rose sauce",                           299, 269, false, SpicyLevel.MILD,   10, 280, false),
            item("Clam Masala",             "Clams cooked in Konkan-style spicy gravy",                     299, 259, false, SpicyLevel.HOT,    25, 310, false),
            item("Bhetki Fish Fry",         "Crispy Bengali bhetki fillet with mustard",                    309, 269, false, SpicyLevel.MEDIUM, 15, 370, false),
            item("Tawa Fish",               "Spice-crusted fish fillet on iron tawa",                        299, 259, false, SpicyLevel.MEDIUM, 20, 360, false),
            item("Lobster Bisque",          "Creamy lobster soup with cognac",                               399, 359, false, SpicyLevel.MILD,   25, 320, false),
            item("Octopus Salad",           "Grilled octopus with olive oil and lemon",                     449, 399, false, SpicyLevel.MILD,   30, 310, false)
        ));

        // ── 18. Breads & Rotis ──────────────────────────────────────────────────
        Category breads = save(category("Breads & Rotis", "Freshly baked breads from the tandoor", "🫓", 18));
        seedItems(breads, List.of(
            item("Butter Naan",             "Soft tandoor naan with butter glaze",                            59,  49, true,  SpicyLevel.MILD,   10, 230, true),
            item("Garlic Naan",             "Naan topped with garlic and fresh coriander",                   69,  59, true,  SpicyLevel.MILD,   10, 240, false),
            item("Stuffed Aloo Paratha",    "Whole wheat bread stuffed with spiced potato",                 119,  99, true,  SpicyLevel.MILD,   15, 370, true),
            item("Missi Roti",              "Gram flour flatbread with spices",                               79,  59, true,  SpicyLevel.MILD,   10, 280, false),
            item("Cheese Naan",             "Naan filled with melted cheese",                                 89,  69, true,  SpicyLevel.MILD,   10, 300, false),
            item("Bhatura",                 "Fluffy deep-fried leavened bread",                               79,  59, true,  SpicyLevel.MILD,   10, 320, false),
            item("Poori",                   "Puffed whole wheat fried bread",                                 69,  49, true,  SpicyLevel.MILD,    8, 270, false),
            item("Roomali Roti",            "Paper-thin soft handkerchief bread",                             49,  39, true,  SpicyLevel.MILD,    8, 160, false),
            item("Tandoori Roti",           "Whole wheat roti baked in tandoor",                              49,  39, true,  SpicyLevel.MILD,    8, 190, false),
            item("Lachha Paratha",          "Flaky multi-layered whole wheat paratha",                        79,  59, true,  SpicyLevel.MILD,   10, 260, false),
            item("Onion Kulcha",            "Soft kulcha stuffed with spiced onion",                          89,  69, true,  SpicyLevel.MILD,   10, 290, false),
            item("Taftan",                  "Saffron-cardamom leavened flatbread",                            79,  59, true,  SpicyLevel.MILD,   10, 250, false),
            item("Peshwari Naan",           "Naan stuffed with coconut, almonds and sugar",                   99,  79, true,  SpicyLevel.MILD,   10, 340, false),
            item("Methi Paratha",           "Fenugreek-flavoured whole wheat paratha",                        79,  59, true,  SpicyLevel.MILD,   10, 240, false),
            item("Appam",                   "Lacy Kerala rice hopper with soft centre",                       99,  79, true,  SpicyLevel.MILD,   10, 220, false),
            item("Akki Roti",               "Karnataka rice flour flatbread with coconut",                   89,  69, true,  SpicyLevel.MILD,   10, 230, false),
            item("Makki di Roti",           "Punjabi cornmeal bread served with sarson",                      79,  59, true,  SpicyLevel.MILD,   10, 250, false),
            item("Chapati",                 "Soft daily whole wheat flatbread",                               39,  29, true,  SpicyLevel.MILD,    8, 150, false),
            item("Pita Bread",              "Soft Middle-Eastern pocket bread",                               69,  49, true,  SpicyLevel.MILD,   10, 200, false),
            item("Focaccia",                "Italian herb-topped flatbread with olive oil",                  109,  89, true,  SpicyLevel.MILD,   15, 280, false)
        ));

        // ── 19. Ice Cream ───────────────────────────────────────────────────────
        Category iceCream = save(category("Ice Cream", "Frozen scoops and sundaes", "🍦", 19));
        seedItems(iceCream, List.of(
            item("Vanilla Scoop",           "Classic Madagascar vanilla bean ice cream",                     99,  79, true,  SpicyLevel.MILD,    5, 200, false),
            item("Chocolate Scoop",         "Rich dark chocolate gelato",                                    99,  79, true,  SpicyLevel.MILD,    5, 220, false),
            item("Mango Sorbet",            "Dairy-free fresh mango sorbet",                                 109,  89, true,  SpicyLevel.MILD,    5, 160, false),
            item("Strawberry Ice Cream",    "Fresh strawberry with cream ice cream",                          99,  79, true,  SpicyLevel.MILD,    5, 190, false),
            item("Butterscotch Scoop",      "Caramel butterscotch swirl ice cream",                          99,  79, true,  SpicyLevel.MILD,    5, 230, false),
            item("Sundae Special",          "Three scoops with hot fudge and cherry",                        179, 149, true,  SpicyLevel.MILD,   10, 520, true),
            item("Banana Split",            "Banana with three scoops and whipped cream",                   199, 169, true,  SpicyLevel.MILD,   10, 580, true),
            item("Kesar Pista Kulfi",       "Saffron and pistachio traditional kulfi",                       129,  99, true,  SpicyLevel.MILD,    5, 260, true),
            item("Tender Coconut Ice Cream","Fresh coconut milk and coconut flesh ice cream",               119,  99, true,  SpicyLevel.MILD,    5, 210, false),
            item("Matcha Ice Cream",        "Japanese green tea ice cream",                                  119,  99, true,  SpicyLevel.MILD,    5, 200, false),
            item("Brownie Ice Cream",       "Warm brownie base with vanilla scoop",                          179, 149, true,  SpicyLevel.MILD,   10, 500, false),
            item("Rose Gulkand Kulfi",      "Rose petal jam kulfi on a stick",                               119,  99, true,  SpicyLevel.MILD,    5, 240, false),
            item("Coffee Ice Cream",        "Espresso swirl in velvety cream",                               109,  89, true,  SpicyLevel.MILD,    5, 210, false),
            item("Blueberry Cheesecake Ice Cream", "Cream cheese ice cream with blueberry ripple",          129,  99, true,  SpicyLevel.MILD,    5, 270, false),
            item("Peanut Butter Cup",       "Chocolate ice cream with peanut butter cups",                  129,  99, true,  SpicyLevel.MILD,    5, 290, false),
            item("Watermelon Popsicle",     "Fresh watermelon frozen on a stick",                             79,  59, true,  SpicyLevel.MILD,    5, 80,  false),
            item("Caramel Walnut Sundae",   "Caramel drizzle with candied walnuts",                          169, 139, true,  SpicyLevel.MILD,   10, 470, false),
            item("Choco Chip Cookie Dough", "Cookie dough chunks in vanilla ice cream",                      129,  99, true,  SpicyLevel.MILD,    5, 300, false),
            item("Alphonso Mango Kulfi",    "Seasonal Alphonso mango kulfi with falooda",                   149, 119, true,  SpicyLevel.MILD,   10, 280, true),
            item("Lychee Sorbet",           "Light and refreshing lychee sorbet",                            109,  89, true,  SpicyLevel.MILD,    5, 140, false)
        ));

        // ── 20. Breakfast ───────────────────────────────────────────────────────
        Category breakfast = save(category("Breakfast", "Start your day right", "🍳", 20));
        seedItems(breakfast, List.of(
            item("English Breakfast",       "Eggs, bacon, sausage, beans and toast",                        299, 249, false, SpicyLevel.MILD,   15, 720, true),
            item("Masala Omelette",         "Three-egg omelette with onion, tomato and chilli",              149, 119, false, SpicyLevel.MEDIUM, 10, 310, false),
            item("Pancakes Stack",          "Fluffy buttermilk pancakes with maple syrup",                  199, 169, true,  SpicyLevel.MILD,   15, 550, true),
            item("Avocado Toast",           "Smashed avocado on sourdough with poached egg",               199, 169, false, SpicyLevel.MILD,   10, 380, true),
            item("Idli Sambar Breakfast",   "Three soft idlis with sambar and chutneys",                   129,  99, true,  SpicyLevel.MILD,   15, 310, false),
            item("Upma",                    "Savoury semolina porridge with veggies",                       109,  89, true,  SpicyLevel.MILD,   10, 290, false),
            item("Poha",                    "Flattened rice with mustard and peanuts",                       99,  79, true,  SpicyLevel.MILD,   10, 260, false),
            item("French Toast",            "Egg-soaked bread toasted with cinnamon sugar",                 169, 139, false, SpicyLevel.MILD,   10, 420, false),
            item("Granola Bowl",            "Crunchy granola with yogurt and seasonal fruits",              199, 169, true,  SpicyLevel.MILD,    5, 380, false),
            item("Shakshuka",               "Poached eggs in spiced tomato pepper sauce",                   199, 169, false, SpicyLevel.MEDIUM, 15, 360, false),
            item("Waffles",                 "Crispy Belgian waffles with berries and cream",               219, 189, true,  SpicyLevel.MILD,   15, 480, false),
            item("Egg Benedict",            "Poached eggs on English muffin with hollandaise",             249, 219, false, SpicyLevel.MILD,   15, 520, false),
            item("Stuffed Paratha Breakfast","Aloo paratha with curd and pickle",                           149, 119, true,  SpicyLevel.MILD,   15, 400, false),
            item("Rava Idli",               "Instant semolina idli with coconut chutney",                  119,  99, true,  SpicyLevel.MILD,   10, 280, false),
            item("Bread Omelette",          "Pan-fried omelette sandwiched in bread",                       129,  99, false, SpicyLevel.MILD,   10, 340, false),
            item("Achari Paratha",          "Pickle-spiced paratha with yogurt",                            139, 109, true,  SpicyLevel.MEDIUM, 15, 360, false),
            item("Banana Pancakes",         "Banana-blended pancakes with honey",                           179, 149, true,  SpicyLevel.MILD,   10, 440, false),
            item("Congee",                  "Asian rice porridge with ginger and sesame oil",              149, 119, false, SpicyLevel.MILD,   15, 250, false),
            item("Masala Dosa Breakfast",   "Crispy dosa with sambar and coconut chutney",                 139, 109, true,  SpicyLevel.MEDIUM, 15, 360, false),
            item("Overnight Oats",          "Chilled oats with fruits and nut butter",                     169, 139, true,  SpicyLevel.MILD,    5, 370, false)
        ));
    }

    // ── helpers ──────────────────────────────────────────────────────────────────

    private Category save(Category c) {
        return categoryRepository.save(c);
    }

    private Category category(String name, String description, String icon, int sortOrder) {
        return Category.builder()
                .name(name)
                .description(description)
                .icon(icon)
                .imageUrl("https://source.unsplash.com/400x300/?" + name.toLowerCase().replace(" ", "-"))
                .sortOrder(sortOrder)
                .active(true)
                .build();
    }

    private void seedItems(Category category, List<FoodItem> items) {
        foodItemRepository.saveAll(items.stream()
                .peek(i -> i.setCategory(category))
                .toList());
    }

    private FoodItem item(String name, String description,
                          int price, Integer discountPrice,
                          boolean vegetarian, SpicyLevel spicyLevel,
                          int prepTime, int calories, boolean bestseller) {
        return FoodItem.builder()
                .name(name)
                .description(description)
                .price(BigDecimal.valueOf(price))
                .discountPrice(discountPrice != null ? BigDecimal.valueOf(discountPrice) : null)
                .vegetarian(vegetarian)
                .spicyLevel(spicyLevel)
                .preparationTime(prepTime)
                .calories(calories)
                .bestseller(bestseller)
                .available(true)
                .rating(BigDecimal.valueOf(4.0 + Math.random() * 0.9).setScale(1, java.math.RoundingMode.HALF_UP))
                .totalRatings((int) (Math.random() * 500 + 50))
                .imageUrl("https://source.unsplash.com/400x300/?" + name.toLowerCase().replace(" ", "-").replace("&", ""))
                .build();
    }
}
