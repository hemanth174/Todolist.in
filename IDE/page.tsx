"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/lib/store"
import {
  ArrowLeft,
  Play,
  Save,
  Download,
  Trash2,
  Copy,
  FolderOpen,
  Plus,
  Code,
  Share2,
  ExternalLink,
  Smartphone,
  Terminal,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CodeSnippet {
  id: string
  name: string
  language: string
  htmlCode: string
  cssCode: string
  jsCode: string
  pythonCode: string
  sqlCode: string
  cppCode: string
  cCode: string
  nodeCode: string
  createdAt: string
  lastModified: string
}

interface ConsoleLog {
  id: string
  type: "log" | "error" | "warn" | "info"
  message: string
  timestamp: Date
}

export default function IDEPage() {
  const router = useRouter()
  const { user } = useGameStore()

  // Code states
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [jsCode, setJsCode] = useState("")
  const [pythonCode, setPythonCode] = useState("")
  const [sqlCode, setSqlCode] = useState("")
  const [cppCode, setCppCode] = useState("")
  const [cCode, setCCode] = useState("")
  const [nodeCode, setNodeCode] = useState("")
  const [output, setOutput] = useState("")
  const [codeError, setCodeError] = useState("")

  // Console states
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [showConsole, setShowConsole] = useState(true)

  // IDE states
  const [savedSnippets, setSavedSnippets] = useState<CodeSnippet[]>([])
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(null)
  const [snippetName, setSnippetName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("web")
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")

  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  // Language configurations
  const languageConfigs = {
    web: { name: "Web Development", tabs: ["HTML", "CSS", "JavaScript"], icon: "🌐" },
    python: { name: "Python", tabs: ["Python"], icon: "🐍" },
    sql: { name: "SQL Database", tabs: ["SQL"], icon: "🗄️" },
    cpp: { name: "C++", tabs: ["C++"], icon: "⚡" },
    c: { name: "C Language", tabs: ["C"], icon: "🔧" },
    nodejs: { name: "Node.js", tabs: ["Node.js"], icon: "🟢" },
  }

  // Add console log
  const addConsoleLog = useCallback((type: ConsoleLog["type"], message: string) => {
    const newLog: ConsoleLog = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    }
    setConsoleLogs((prev) => [...prev, newLog])
  }, [])

  // Clear console
  const clearConsole = () => {
    setConsoleLogs([])
  }

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Keyboard shortcuts (removed Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            setShowSaveDialog(true)
            break
          case "o":
            e.preventDefault()
            setShowLoadDialog(true)
            break
          case "r":
            e.preventDefault()
            loadTemplate()
            break
          case "p":
            e.preventDefault()
            if (selectedLanguage === "web") {
              publishWebsite()
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedLanguage])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Load saved snippets from localStorage
    const saved = localStorage.getItem(`ide-snippets-${user.id}`)
    if (saved) {
      setSavedSnippets(JSON.parse(saved))
    }

    // Load default template
    loadTemplate()
  }, [user, router])

  // Language change with loader
  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === selectedLanguage) return

    setIsLoading(true)
    setLoadingMessage(
      `Initializing ${languageConfigs[newLanguage as keyof typeof languageConfigs].name} environment...`,
    )

    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSelectedLanguage(newLanguage)
    clearConsole()
    addConsoleLog("info", `${languageConfigs[newLanguage as keyof typeof languageConfigs].name} environment ready!`)

    // Load template for new language
    await loadTemplate(newLanguage)

    setIsLoading(false)
  }

  const loadTemplate = useCallback(
    async (language?: string) => {
      const lang = language || selectedLanguage

      // Clear all code first
      setHtmlCode("")
      setCssCode("")
      setJsCode("")
      setPythonCode("")
      setSqlCode("")
      setCppCode("")
      setCCode("")
      setNodeCode("")
      setOutput("")
      setCodeError("")

      if (lang === "web") {
        setHtmlCode(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Project</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Web Project! 🚀</h1>
        <p>This is a modern web development playground.</p>
        <button id="clickBtn" onclick="handleClick()">Click Me!</button>
        <div id="output"></div>
        <div class="feature-grid">
            <div class="feature-card">
                <h3>HTML5</h3>
                <p>Modern markup</p>
            </div>
            <div class="feature-card">
                <h3>CSS3</h3>
                <p>Beautiful styling</p>
            </div>
            <div class="feature-card">
                <h3>JavaScript</h3>
                <p>Interactive features</p>
            </div>
        </div>
    </div>
</body>
</html>`)

        setCssCode(`/* Modern CSS Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
}

h1 {
    color: #333;
    margin-bottom: 20px;
    text-align: center;
    font-size: 2.5rem;
}

p {
    color: #666;
    margin-bottom: 30px;
    text-align: center;
    font-size: 1.2rem;
}

button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;
    display: block;
    margin: 0 auto 30px;
}

button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

#output {
    margin: 30px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 15px;
    border-left: 5px solid #667eea;
    min-height: 60px;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 40px;
}

.feature-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-card h3 {
    color: #667eea;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.feature-card p {
    color: #888;
    margin: 0;
    font-size: 1rem;
}`)

        setJsCode(`// Modern JavaScript with Console Integration
let clickCount = 0;

// Enhanced click handler with console logging
function handleClick() {
    clickCount++;
    console.log(\`Button clicked \${clickCount} times!\`);
    
    const output = document.getElementById('output');
    const messages = [
        "🎉 Awesome! Keep clicking!",
        "🚀 You're on fire!",
        "⭐ Great job!",
        "🎯 Perfect click!",
        "💫 Amazing work!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    output.innerHTML = \`
        <h3>\${randomMessage}</h3>
        <p>Total clicks: <strong>\${clickCount}</strong></p>
        <p>Current time: <strong>\${new Date().toLocaleTimeString()}</strong></p>
        <div style="margin-top: 15px;">
            <div style="background: linear-gradient(45deg, #667eea, #764ba2); height: 10px; border-radius: 5px; width: \${Math.min(clickCount * 10, 100)}%;"></div>
            <small>Progress: \${Math.min(clickCount * 10, 100)}%</small>
        </div>
    \`;
    
    // Add some visual feedback
    const button = document.getElementById('clickBtn');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
    
    // Console logging examples
    if (clickCount === 5) {
        console.warn('You\\'ve clicked 5 times! That\\'s a lot!');
    }
    
    if (clickCount === 10) {
        console.error('Whoa! 10 clicks! Maybe take a break? 😄');
    }
    
    if (clickCount % 3 === 0) {
        console.info(\`Click count is divisible by 3: \${clickCount}\`);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 Web application loaded successfully!');
    console.log('Ready for interaction...');
    
    // Auto-click to show initial content
    handleClick();
    
    // Add some interactive features
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            console.log(\`Clicked on feature card: \${card.querySelector('h3').textContent}\`);
            card.style.background = \`hsl(\${index * 120}, 70%, 95%)\`;
            setTimeout(() => {
                card.style.background = 'white';
            }, 1000);
        });
    });
});

// Error handling example
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.message);
});`)

        addConsoleLog("info", "Web development environment loaded with HTML, CSS, and JavaScript")
      } else if (lang === "python") {
        setPythonCode(`# Python Programming Environment
# Advanced examples with console output

import math
import random
from datetime import datetime

print("🐍 Python Environment Initialized!")
print("=" * 50)

# 1. Object-Oriented Programming Example
class SmartCalculator:
    def __init__(self):
        self.history = []
        self.operations_count = 0
        print("📱 Smart Calculator created!")
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        self.operations_count += 1
        print(f"➕ Addition: {a} + {b} = {result}")
        return result
    
    def multiply(self, a, b):
        result = a * b
        self.history.append(f"{a} × {b} = {result}")
        self.operations_count += 1
        print(f"✖️ Multiplication: {a} × {b} = {result}")
        return result
    
    def power(self, base, exp):
        result = base ** exp
        self.history.append(f"{base}^{exp} = {result}")
        self.operations_count += 1
        print(f"🔢 Power: {base}^{exp} = {result}")
        return result
    
    def factorial(self, n):
        if n < 0:
            return "Error: Factorial not defined for negative numbers"
        result = math.factorial(n)
        self.history.append(f"{n}! = {result}")
        self.operations_count += 1
        print(f"❗ Factorial: {n}! = {result}")
        return result
    
    def show_stats(self):
        print(f"\\n📊 Calculator Statistics:")
        print(f"Total operations: {self.operations_count}")
        print(f"History entries: {len(self.history)}")
        if self.history:
            print("Recent operations:")
            for op in self.history[-3:]:
                print(f"  • {op}")

# 2. Data Analysis Example
def analyze_data():
    print("\\n📈 Data Analysis Demo")
    print("-" * 30)
    
    # Generate sample data
    data = [random.randint(1, 100) for _ in range(20)]
    print(f"Sample data: {data[:10]}... (showing first 10)")
    
    # Statistical analysis
    mean = sum(data) / len(data)
    median = sorted(data)[len(data)//2]
    max_val = max(data)
    min_val = min(data)
    
    print(f"📊 Statistics:")
    print(f"  Mean: {mean:.2f}")
    print(f"  Median: {median}")
    print(f"  Max: {max_val}")
    print(f"  Min: {min_val}")
    print(f"  Range: {max_val - min_val}")
    
    return data

# 3. File and String Processing
def text_processor():
    print("\\n📝 Text Processing Demo")
    print("-" * 30)
    
    sample_text = """
    Python is a powerful programming language.
    It's great for beginners and experts alike.
    You can build web apps, analyze data, create AI models, and much more!
    """
    
    words = sample_text.split()
    word_count = len(words)
    char_count = len(sample_text)
    unique_words = len(set(word.lower().strip('.,!') for word in words))
    
    print(f"📄 Text Analysis:")
    print(f"  Total words: {word_count}")
    print(f"  Total characters: {char_count}")
    print(f"  Unique words: {unique_words}")
    
    # Word frequency
    word_freq = {}
    for word in words:
        clean_word = word.lower().strip('.,!')
        if len(clean_word) > 3:  # Only count words longer than 3 chars
            word_freq[clean_word] = word_freq.get(clean_word, 0) + 1
    
    print("🔤 Most common words:")
    for word, count in sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  • {word}: {count}")

# 4. Advanced Functions and Decorators
def timer_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = datetime.now()
        result = func(*args, **kwargs)
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        print(f"⏱️ Function '{func.__name__}' took {duration:.4f} seconds")
        return result
    return wrapper

@timer_decorator
def fibonacci_sequence(n):
    print(f"\\n🔢 Generating Fibonacci sequence (first {n} numbers):")
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    print(f"Fibonacci: {fib}")
    return fib

# Main execution
if __name__ == "__main__":
    print(f"🕒 Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create and use calculator
    calc = SmartCalculator()
    calc.add(15, 25)
    calc.multiply(7, 8)
    calc.power(2, 10)
    calc.factorial(6)
    calc.show_stats()
    
    # Run data analysis
    data = analyze_data()
    
    # Process text
    text_processor()
    
    # Generate Fibonacci
    fibonacci_sequence(10)
    
    print("\\n✅ Python demo completed successfully!")
    print("🎯 Try modifying the code above or write your own Python code below:")
    print("=" * 50)

# Your code area - write your Python code here:
`)
        addConsoleLog("info", "Python environment loaded with advanced examples and libraries")
      } else if (lang === "sql") {
        setSqlCode(`-- SQL Database Environment
-- Advanced database queries and operations

-- Sample database schema and data
-- This simulates a complete e-commerce database

-- ============================================
-- 1. BASIC QUERIES AND DATA EXPLORATION
-- ============================================

-- View all tables in our sample database
SHOW TABLES;

-- Basic SELECT operations
SELECT 'Welcome to SQL Environment!' as message;
SELECT NOW() as current_timestamp;
SELECT VERSION() as database_version;

-- Sample data exploration
SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    'Customer information' as description
FROM users
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records,
    'Order transactions' as description
FROM orders
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as total_records,
    'Product catalog' as description
FROM products;

-- ============================================
-- 2. ADVANCED JOINS AND RELATIONSHIPS
-- ============================================

-- Complex multi-table join with analytics
SELECT 
    u.name as customer_name,
    u.email,
    u.city,
    u.registration_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.order_date) as last_order_date,
    DATEDIFF(NOW(), MAX(o.order_date)) as days_since_last_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email, u.city, u.registration_date
HAVING total_orders > 0
ORDER BY total_spent DESC
LIMIT 15;

-- Product performance analysis
SELECT 
    p.name as product_name,
    p.category,
    p.price,
    p.stock_quantity,
    COUNT(oi.product_id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) as total_revenue,
    ROUND(AVG(pr.rating), 2) as avg_rating,
    COUNT(pr.id) as review_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity
ORDER BY total_revenue DESC;

-- ============================================
-- 3. WINDOW FUNCTIONS AND ANALYTICS
-- ============================================

-- Sales trends with window functions
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') as month,
    COUNT(*) as orders_count,
    SUM(total_amount) as monthly_revenue,
    AVG(total_amount) as avg_order_value,
    LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(order_date, '%Y-%m')) as prev_month_revenue,
    ROUND(
        ((SUM(total_amount) - LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(order_date, '%Y-%m'))) 
         / LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(order_date, '%Y-%m'))) * 100, 2
    ) as revenue_growth_percent
FROM orders
WHERE order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;

-- Customer ranking and segmentation
SELECT 
    u.name,
    u.email,
    SUM(o.total_amount) as total_spent,
    COUNT(o.id) as order_count,
    RANK() OVER (ORDER BY SUM(o.total_amount) DESC) as spending_rank,
    NTILE(4) OVER (ORDER BY SUM(o.total_amount) DESC) as customer_quartile,
    CASE 
        WHEN SUM(o.total_amount) > 5000 THEN 'VIP'
        WHEN SUM(o.total_amount) > 2000 THEN 'Premium'
        WHEN SUM(o.total_amount) > 500 THEN 'Regular'
        ELSE 'New'
    END as customer_segment
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- ============================================
-- 4. COMPLEX SUBQUERIES AND CTEs
-- ============================================

-- Common Table Expressions (CTEs) for complex analysis
WITH monthly_stats AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') as month,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        COUNT(DISTINCT user_id) as unique_customers
    FROM orders
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
),
product_performance AS (
    SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(oi.quantity * oi.unit_price) as category_revenue
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.category
)
SELECT 
    ms.month,
    ms.order_count,
    ms.revenue,
    ms.unique_customers,
    ROUND(ms.revenue / ms.order_count, 2) as avg_order_value,
    ROUND(ms.revenue / ms.unique_customers, 2) as revenue_per_customer
FROM monthly_stats ms
ORDER BY ms.month DESC
LIMIT 6;

-- ============================================
-- 5. DATA MODIFICATION AND MAINTENANCE
-- ============================================

-- Update inventory based on sales
UPDATE products p
SET stock_quantity = stock_quantity - (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM order_items oi
    WHERE oi.product_id = p.id
    AND oi.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
)
WHERE p.id IN (
    SELECT DISTINCT product_id 
    FROM order_items 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- 6. STORED PROCEDURES AND FUNCTIONS
-- ============================================

DELIMITER //

CREATE PROCEDURE GetCustomerSummary(IN customer_id INT)
BEGIN
    SELECT 
        u.name,
        u.email,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MAX(o.order_date) as last_order_date
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = customer_id
    GROUP BY u.id, u.name, u.email;
END //

DELIMITER ;

-- ============================================
-- YOUR SQL PLAYGROUND
-- ============================================

-- Write your own SQL queries below:
-- Try experimenting with:
-- • JOIN operations between tables
-- • Aggregate functions (COUNT, SUM, AVG, etc.)
-- • Window functions (ROW_NUMBER, RANK, etc.)
-- • Subqueries and CTEs
-- • Data filtering with WHERE and HAVING

SELECT 'Ready for your SQL queries!' as status;`)
        addConsoleLog("info", "SQL environment loaded with sample database and advanced queries")
      } else if (lang === "cpp") {
        setCppCode(`// C++ Programming Environment
// Modern C++ with advanced features and examples

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <map>
#include <chrono>
#include <random>
#include <thread>

using namespace std;
using namespace std::chrono;

// ============================================
// 1. OBJECT-ORIENTED PROGRAMMING
// ============================================

class SmartArray {
private:
    vector<int> data;
    string name;

public:
    SmartArray(const string& arrayName) : name(arrayName) {
        cout << "🔧 SmartArray '" << name << "' created!" << endl;
    }
    
    ~SmartArray() {
        cout << "🗑️ SmartArray '" << name << "' destroyed!" << endl;
    }
    
    void add(int value) {
        data.push_back(value);
        cout << "➕ Added " << value << " to " << name << endl;
    }
    
    void display() const {
        cout << "📊 " << name << " contents: [";
        for (size_t i = 0; i < data.size(); ++i) {
            cout << data[i];
            if (i < data.size() - 1) cout << ", ";
        }
        cout << "]" << endl;
    }
    
    void sort() {
        std::sort(data.begin(), data.end());
        cout << "🔄 " << name << " sorted!" << endl;
    }
    
    double average() const {
        if (data.empty()) return 0.0;
        double sum = 0;
        for (int val : data) sum += val;
        return sum / data.size();
    }
    
    int size() const { return data.size(); }
};

// ============================================
// 2. TEMPLATE PROGRAMMING
// ============================================

template<typename T>
class Calculator {
public:
    static T add(T a, T b) {
        cout << "➕ Template Add: " << a << " + " << b << " = " << (a + b) << endl;
        return a + b;
    }
    
    static T multiply(T a, T b) {
        cout << "✖️ Template Multiply: " << a << " × " << b << " = " << (a * b) << endl;
        return a * b;
    }
    
    static T power(T base, int exp) {
        T result = 1;
        for (int i = 0; i < exp; ++i) {
            result *= base;
        }
        cout << "🔢 Template Power: " << base << "^" << exp << " = " << result << endl;
        return result;
    }
};

// ============================================
// 3. ADVANCED ALGORITHMS
// ============================================

void demonstrateAlgorithms() {
    cout << "\\n🧮 Algorithm Demonstrations" << endl;
    cout << "================================" << endl;
    
    vector<int> numbers = {64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42};
    cout << "Original array: ";
    for (int n : numbers) cout << n << " ";
    cout << endl;
    
    // Bubble Sort demonstration
    vector<int> bubbleSort = numbers;
    auto start = high_resolution_clock::now();
    
    for (size_t i = 0; i < bubbleSort.size() - 1; ++i) {
        for (size_t j = 0; j < bubbleSort.size() - i - 1; ++j) {
            if (bubbleSort[j] > bubbleSort[j + 1]) {
                swap(bubbleSort[j], bubbleSort[j + 1]);
            }
        }
    }
    
    auto end = high_resolution_clock::now();
    auto duration = duration_cast<microseconds>(end - start);
    
    cout << "Bubble sorted: ";
    for (int n : bubbleSort) cout << n << " ";
    cout << "\\n⏱️ Time taken: " << duration.count() << " microseconds" << endl;
    
    // STL sort comparison
    vector<int> stlSort = numbers;
    start = high_resolution_clock::now();
    sort(stlSort.begin(), stlSort.end());
    end = high_resolution_clock::now();
    duration = duration_cast<microseconds>(end - start);
    
    cout << "STL sorted: ";
    for (int n : stlSort) cout << n << " ";
    cout << "\\n⏱️ STL Time: " << duration.count() << " microseconds" << endl;
}

// ============================================
// 4. MEMORY MANAGEMENT WITH SMART POINTERS
// ============================================

class Resource {
private:
    string name;
    int id;

public:
    Resource(const string& n, int i) : name(n), id(i) {
        cout << "🔧 Resource '" << name << "' (ID: " << id << ") created" << endl;
    }
    
    ~Resource() {
        cout << "🗑️ Resource '" << name << "' (ID: " << id << ") destroyed" << endl;
    }
    
    void use() {
        cout << "🔨 Using resource '" << name << "' (ID: " << id << ")" << endl;
    }
};

void demonstrateSmartPointers() {
    cout << "\\n🧠 Smart Pointer Demonstration" << endl;
    cout << "================================" << endl;
    
    // unique_ptr example
    {
        auto uniqueRes = make_unique<Resource>("UniqueResource", 1);
        uniqueRes->use();
        cout << "📍 unique_ptr scope ending..." << endl;
    } // unique_ptr automatically deletes resource here
    
    // shared_ptr example
    {
        auto sharedRes1 = make_shared<Resource>("SharedResource", 2);
        cout << "📊 Reference count: " << sharedRes1.use_count() << endl;
        
        {
            auto sharedRes2 = sharedRes1; // Copy shared_ptr
            cout << "📊 Reference count after copy: " << sharedRes1.use_count() << endl;
            sharedRes2->use();
        } // sharedRes2 goes out of scope
        
        cout << "📊 Reference count after inner scope: " << sharedRes1.use_count() << endl;
    } // Last shared_ptr goes out of scope, resource deleted
}

// ============================================
// 5. MULTITHREADING EXAMPLE
// ============================================

void workerThread(int threadId, int workAmount) {
    cout << "🧵 Thread " << threadId << " starting work..." << endl;
    
    for (int i = 1; i <= workAmount; ++i) {
        this_thread::sleep_for(milliseconds(100));
        cout << "🔄 Thread " << threadId << " progress: " << i << "/" << workAmount << endl;
    }
    
    cout << "✅ Thread " << threadId << " completed!" << endl;
}

void demonstrateMultithreading() {
    cout << "\\n🧵 Multithreading Demonstration" << endl;
    cout << "================================" << endl;
    
    vector<thread> threads;
    
    // Create multiple worker threads
    for (int i = 1; i <= 3; ++i) {
        threads.emplace_back(workerThread, i, 3);
    }
    
    // Wait for all threads to complete
    for (auto& t : threads) {
        t.join();
    }
    
    cout << "🏁 All threads completed!" << endl;
}

// ============================================
// MAIN FUNCTION
// ============================================

int main() {
    cout << "🚀 C++ Advanced Programming Environment" << endl;
    cout << "========================================" << endl;
    
    // Object-oriented programming demo
    SmartArray myArray("NumberCollection");
    myArray.add(42);
    myArray.add(17);
    myArray.add(99);
    myArray.add(3);
    myArray.display();
    myArray.sort();
    myArray.display();
    cout << "📊 Average: " << myArray.average() << endl;
    
    // Template programming demo
    cout << "\\n🔧 Template Programming:" << endl;
    Calculator<int>::add(15, 25);
    Calculator<double>::multiply(3.14, 2.0);
    Calculator<int>::power(2, 8);
    
    // Algorithm demonstration
    demonstrateAlgorithms();
    
    // Smart pointer demonstration
    demonstrateSmartPointers();
    
    // Multithreading demonstration
    demonstrateMultithreading();
    
    cout << "\\n✅ C++ demonstration completed!" << endl;
    cout << "🎯 Try writing your own C++ code below:" << endl;
    cout << "========================================" << endl;
    
    return 0;
}

/*
🎯 YOUR C++ CODE AREA
Write your C++ code here. You can:
• Create classes and objects
• Use STL containers and algorithms
• Implement templates
• Practice memory management
• Experiment with modern C++ features
*/`)
        addConsoleLog("info", "C++ environment loaded with modern features and examples")
      } else if (lang === "c") {
        setCCode(`// C Programming Environment
// Classic C programming with advanced examples

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>

// ============================================
// 1. STRUCTURE DEFINITIONS
// ============================================

typedef struct {
    int id;
    char name[50];
    float salary;
    int age;
} Employee;

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct {
    int* array;
    int size;
    int capacity;
} DynamicArray;

// ============================================
// 2. FUNCTION PROTOTYPES
// ============================================

void printWelcome(void);
void demonstrateBasics(void);
void demonstrateArrays(void);
void demonstrateStrings(void);
void demonstrateStructures(void);
void demonstratePointers(void);
void demonstrateLinkedList(void);
void demonstrateDynamicMemory(void);
void demonstrateFileOperations(void);

// Dynamic Array functions
DynamicArray* createDynamicArray(int initialCapacity);
void addElement(DynamicArray* arr, int element);
void printDynamicArray(DynamicArray* arr);
void freeDynamicArray(DynamicArray* arr);

// Linked List functions
Node* createNode(int data);
void insertAtBeginning(Node** head, int data);
void printList(Node* head);
void freeList(Node* head);

// ============================================
// 3. MAIN FUNCTION
// ============================================

int main() {
    printWelcome();
    
    printf("\\n🔧 Starting C Programming Demonstrations...\\n");
    printf("==============================================\\n");
    
    demonstrateBasics();
    demonstrateArrays();
    demonstrateStrings();
    demonstrateStructures();
    demonstratePointers();
    demonstrateLinkedList();
    demonstrateDynamicMemory();
    demonstrateFileOperations();
    
    printf("\\n✅ All demonstrations completed successfully!\\n");
    printf("🎯 Try writing your own C code below:\\n");
    printf("=====================================\\n");
    
    return 0;
}

// ============================================
// 4. FUNCTION IMPLEMENTATIONS
// ============================================

void printWelcome(void) {
    printf("🚀 Welcome to C Programming Environment!\\n");
    printf("========================================\\n");
    printf("📅 Compiled on: %s at %s\\n", __DATE__, __TIME__);
    printf("💻 Compiler: %s\\n", 
    #ifdef __GNUC__
        "GCC"
    #elif defined(_MSC_VER)
        "MSVC"
    #else
        "Unknown"
    #endif
    );
}

void demonstrateBasics(void) {
    printf("\\n📚 Basic C Programming Concepts\\n");
    printf("--------------------------------\\n");
    
    // Variables and data types
    int integer = 42;
    float floating = 3.14159f;
    double precise = 2.718281828;
    char character = 'A';
    char string[] = "Hello, C Programming!";
    
    printf("🔢 Integer: %d\\n", integer);
    printf("🔢 Float: %.2f\\n", floating);
    printf("🔢 Double: %.6f\\n", precise);
    printf("🔤 Character: %c\\n", character);
    printf("📝 String: %s\\n", string);
    
    // Arithmetic operations
    printf("\\n➕ Arithmetic Operations:\\n");
    printf("42 + 8 = %d\\n", integer + 8);
    printf("42 - 8 = %d\\n", integer - 8);
    printf("42 * 2 = %d\\n", integer * 2);
    printf("42 / 7 = %d\\n", integer / 7);
    printf("42 %% 5 = %d\\n", integer % 5);
    
    // Conditional statements
    printf("\\n🔀 Conditional Logic:\\n");
    if (integer > 40) {
        printf("✅ Integer %d is greater than 40\\n", integer);
    } else {
        printf("❌ Integer %d is not greater than 40\\n", integer);
    }
    
    // Loops
    printf("\\n🔄 Loop Example (counting to 5):\\n");
    for (int i = 1; i <= 5; i++) {
        printf("Count: %d ", i);
    }
    printf("\\n");
}

void demonstrateArrays(void) {
    printf("\\n📊 Array Operations\\n");
    printf("-------------------\\n");
    
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Original array: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    // Find maximum and minimum
    int max = numbers[0], min = numbers[0];
    int sum = 0;
    
    for (int i = 0; i < size; i++) {
        if (numbers[i] > max) max = numbers[i];
        if (numbers[i] < min) min = numbers[i];
        sum += numbers[i];
    }
    
    printf("📈 Maximum: %d\\n", max);
    printf("📉 Minimum: %d\\n", min);
    printf("➕ Sum: %d\\n", sum);
    printf("📊 Average: %.2f\\n", (float)sum / size);
    
    // Bubble sort
    printf("\\n🔄 Sorting array using bubble sort...\\n");
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - i - 1; j++) {
            if (numbers[j] > numbers[j + 1]) {
                int temp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = temp;
            }
        }
    }
    
    printf("Sorted array: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
}

void demonstrateStrings(void) {
    printf("\\n📝 String Operations\\n");
    printf("--------------------\\n");
    
    char str1[100] = "Hello";
    char str2[] = " World!";
    char str3[100];
    
    printf("String 1: '%s'\\n", str1);
    printf("String 2: '%s'\\n", str2);
    
    // String concatenation
    strcat(str1, str2);
    printf("After concatenation: '%s'\\n", str1);
    
    // String copy
    strcpy(str3, str1);
    printf("Copied string: '%s'\\n", str3);
    
    // String length
    printf("Length of string: %lu\\n", strlen(str1));
    
    // String comparison
    if (strcmp(str1, str3) == 0) {
        printf("✅ Strings are equal\\n");
    } else {
        printf("❌ Strings are not equal\\n");
    }
    
    // Character analysis
    char text[] = "C Programming 2024!";
    int letters = 0, digits = 0, spaces = 0, others = 0;
    
    printf("\\nAnalyzing text: '%s'\\n", text);
    for (int i = 0; text[i] != '\\0'; i++) {
        if ((text[i] >= 'A' && text[i] <= 'Z') || (text[i] >= 'a' && text[i] <= 'z')) {
            letters++;
        } else if (text[i] >= '0' && text[i] <= '9') {
            digits++;
        } else if (text[i] == ' ') {
            spaces++;
        } else {
            others++;
        }
    }
    
    printf("📊 Analysis: %d letters, %d digits, %d spaces, %d others\\n", 
           letters, digits, spaces, others);
}

void demonstrateStructures(void) {
    printf("\\n👥 Structure Operations\\n");
    printf("-----------------------\\n");
    
    Employee employees[3] = {
        {1, "Alice Johnson", 75000.50, 28},
        {2, "Bob Smith", 82000.75, 35},
        {3, "Carol Davis", 68000.25, 26}
    };
    
    printf("📋 Employee Database:\\n");
    printf("ID\\tName\\t\\tSalary\\t\\tAge\\n");
    printf("--\\t----\\t\\t------\\t\\t---\\n");
    
    float totalSalary = 0;
    for (int i = 0; i < 3; i++) {
        printf("%d\\t%-15s\\t$%.2f\\t\\t%d\\n", 
               employees[i].id, 
               employees[i].name, 
               employees[i].salary, 
               employees[i].age);
        totalSalary += employees[i].salary;
    }
    
    printf("\\n💰 Total Salary Budget: $%.2f\\n", totalSalary);
    printf("📊 Average Salary: $%.2f\\n", totalSalary / 3);
}

void demonstratePointers(void) {
    printf("\\n👉 Pointer Operations\\n");
    printf("---------------------\\n");
    
    int value = 100;
    int* ptr = &value;
    
    printf("🔢 Value: %d\\n", value);
    printf("📍 Address of value: %p\\n", (void*)&value);
    printf("👉 Pointer points to: %p\\n", (void*)ptr);
    printf("🔍 Value through pointer: %d\\n", *ptr);
    
    // Modify value through pointer
    *ptr = 200;
    printf("\\nAfter modifying through pointer:\\n");
    printf("🔢 Value: %d\\n", value);
    printf("🔍 Value through pointer: %d\\n", *ptr);
    
    // Pointer arithmetic
    int array[] = {10, 20, 30, 40, 50};
    int* arrPtr = array;
    
    printf("\\n📊 Array traversal using pointer arithmetic:\\n");
    for (int i = 0; i < 5; i++) {
        printf("Element %d: %d (address: %p)\\n", i, *(arrPtr + i), (void*)(arrPtr + i));
    }
}

// Linked List functions
Node* createNode(int data) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    if (newNode == NULL) {
        printf("❌ Memory allocation failed!\\n");
        return NULL;
    }
    newNode->data = data;
    newNode->next = NULL;
    return newNode;
}

void insertAtBeginning(Node** head, int data) {
    Node* newNode = createNode(data);
    if (newNode != NULL) {
        newNode->next = *head;
        *head = newNode;
        printf("➕ Inserted %d at beginning\\n", data);
    }
}

void printList(Node* head) {
    printf("🔗 Linked List: ");
    Node* current = head;
    while (current != NULL) {
        printf("%d -> ", current->data);
        current = current->next;
    }
    printf("NULL\\n");
}

void freeList(Node* head) {
    Node* current = head;
    while (current != NULL) {
        Node* next = current->next;
        free(current);
        current = next;
    }
    printf("🗑️ Linked list memory freed\\n");
}

void demonstrateLinkedList(void) {
    printf("\\n🔗 Linked List Operations\\n");
    printf("-------------------------\\n");
    
    Node* head = NULL;
    
    insertAtBeginning(&head, 30);
    insertAtBeginning(&head, 20);
    insertAtBeginning(&head, 10);
    
    printList(head);
    
    // Count nodes
    int count = 0;
    Node* current = head;
    while (current != NULL) {
        count++;
        current = current->next;
    }
    printf("📊 Total nodes: %d\\n", count);
    
    freeList(head);
}

// Dynamic Array functions
DynamicArray* createDynamicArray(int initialCapacity) {
    DynamicArray* arr = (DynamicArray*)malloc(sizeof(DynamicArray));
    if (arr == NULL) return NULL;
    
    arr->array = (int*)malloc(initialCapacity * sizeof(int));
    if (arr->array == NULL) {
        free(arr);
        return NULL;
    }
    
    arr->size = 0;
    arr->capacity = initialCapacity;
    printf("🔧 Dynamic array created with capacity %d\\n", initialCapacity);
    return arr;
}

void addElement(DynamicArray* arr, int element) {
    if (arr->size >= arr->capacity) {
        arr->capacity *= 2;
        arr->array = (int*)realloc(arr->array, arr->capacity * sizeof(int));
        printf("📈 Array resized to capacity %d\\n", arr->capacity);
    }
    
    arr->array[arr->size] = element;
    arr->size++;
    printf("➕ Added element %d\\n", element);
}

void printDynamicArray(DynamicArray* arr) {
    printf("📊 Dynamic Array [%d/%d]: ", arr->size, arr->capacity);
    for (int i = 0; i < arr->size; i++) {
        printf("%d ", arr->array[i]);
    }
    printf("\\n");
}

void freeDynamicArray(DynamicArray* arr) {
    if (arr != NULL) {
        free(arr->array);
        free(arr);
        printf("🗑️ Dynamic array memory freed\\n");
    }
}

void demonstrateDynamicMemory(void) {
    printf("\\n💾 Dynamic Memory Management\\n");
    printf("----------------------------\\n");
    
    DynamicArray* myArray = createDynamicArray(2);
    if (myArray == NULL) {
        printf("❌ Failed to create dynamic array\\n");
        return;
    }
    
    addElement(myArray, 100);
    addElement(myArray, 200);
    printDynamicArray(myArray);
    
    addElement(myArray, 300); // This should trigger resize
    addElement(myArray, 400);
    printDynamicArray(myArray);
    
    freeDynamicArray(myArray);
}

void demonstrateFileOperations(void) {
    printf("\\n📁 File Operations\\n");
    printf("------------------\\n");
    
    // Write to file
    FILE* file = fopen("sample.txt", "w");
    if (file != NULL) {
        fprintf(file, "Hello from C Programming!\\n");
        fprintf(file, "This is a sample file.\\n");
        fprintf(file, "Numbers: %d, %d, %d\\n", 1, 2, 3);
        fclose(file);
        printf("✅ Data written to sample.txt\\n");
    } else {
        printf("❌ Could not create file\\n");
        return;
    }
    
    // Read from file
    file = fopen("sample.txt", "r");
    if (file != NULL) {
        char buffer[256];
        printf("📖 Reading from file:\\n");
        while (fgets(buffer, sizeof(buffer), file) != NULL) {
            printf("   %s", buffer);
        }
        fclose(file);
    } else {
        printf("❌ Could not read file\\n");
    }
}

/*
🎯 YOUR C CODE AREA
Write your C code here. You can:
• Practice with variables and data types
• Work with arrays and strings
• Create and use structures
• Implement algorithms
• Practice pointer operations
• Work with dynamic memory allocation
*/`)
        addConsoleLog("info", "C environment loaded with comprehensive examples and memory management")
      } else if (lang === "nodejs") {
        setNodeCode(`// Node.js Environment
// Server-side JavaScript with advanced features

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

console.log('🟢 Node.js Environment Initialized!');
console.log('====================================');
console.log(\`📊 Node.js Version: \${process.version}\`);
console.log(\`💻 Platform: \${process.platform}\`);
console.log(\`🏗️ Architecture: \${process.arch}\`);
console.log(\`📁 Current Directory: \${process.cwd()}\`);

// ============================================
// 1. ASYNCHRONOUS PROGRAMMING
// ============================================

console.log('\\n⚡ Asynchronous Programming Examples');
console.log('===================================');

// Promise-based example
function simulateAsyncOperation(name, delay) {
    return new Promise((resolve) => {
        console.log(\`🔄 Starting \${name}...\`);
        setTimeout(() => {
            console.log(\`✅ \${name} completed after \${delay}ms\`);
            resolve(\`Result from \${name}\`);
        }, delay);
    });
}

// Async/await example
async function demonstrateAsyncAwait() {
    console.log('\\n🚀 Async/Await Demonstration:');
    
    try {
        const start = performance.now();
        
        // Sequential execution
        console.log('📝 Sequential execution:');
        await simulateAsyncOperation('Task 1', 500);
        await simulateAsyncOperation('Task 2', 300);
        await simulateAsyncOperation('Task 3', 200);
        
        const sequentialTime = performance.now() - start;
        console.log(\`⏱️ Sequential time: \${sequentialTime.toFixed(2)}ms\`);
        
        // Parallel execution
        console.log('\\n🔀 Parallel execution:');
        const parallelStart = performance.now();
        
        const results = await Promise.all([
            simulateAsyncOperation('Parallel Task 1', 500),
            simulateAsyncOperation('Parallel Task 2', 300),
            simulateAsyncOperation('Parallel Task 3', 200)
        ]);
        
        const parallelTime = performance.now() - parallelStart;
        console.log(\`⏱️ Parallel time: \${parallelTime.toFixed(2)}ms\`);
        console.log(\`📊 Results: \${results.join(', ')}\`);
        
    } catch (error) {
        console.error('❌ Error in async operation:', error);
    }
}

// ============================================
// 2. FILE SYSTEM OPERATIONS
// ============================================

function demonstrateFileOperations() {
    console.log('\\n📁 File System Operations');
    console.log('=========================');
    
    const fileName = 'nodejs-demo.txt';
    const data = \`Node.js Demo File
Created at: \${new Date().toISOString()}
Random number: \${Math.random()}
Process ID: \${process.pid}
Memory usage: \${JSON.stringify(process.memoryUsage(), null, 2)}\`;
    
    // Write file asynchronously
    fs.writeFile(fileName, data, 'utf8', (err) => {
        if (err) {
            console.error('❌ Error writing file:', err);
            return;
        }
        
        console.log(\`✅ File '\${fileName}' created successfully\`);
        
        // Read file asynchronously
        fs.readFile(fileName, 'utf8', (err, content) => {
            if (err) {
                console.error('❌ Error reading file:', err);
                return;
            }
            
            console.log('📖 File contents:');
            console.log(content);
            
            // Get file stats
            fs.stat(fileName, (err, stats) => {
                if (err) {
                    console.error('❌ Error getting file stats:', err);
                    return;
                }
                
                console.log('📊 File statistics:');
                console.log(\`  Size: \${stats.size} bytes\`);
                console.log(\`  Created: \${stats.birthtime}\`);
                console.log(\`  Modified: \${stats.mtime}\`);
                console.log(\`  Is file: \${stats.isFile()}\`);
                console.log(\`  Is directory: \${stats.isDirectory()}\`);
            });
        });
    });
}

// ============================================
// 3. HTTP SERVER EXAMPLE
// ============================================

function createSimpleServer() {
    console.log('\\n🌐 HTTP Server Example');
    console.log('======================');
    
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;
        
        console.log(\`📨 Request: \${req.method} \${pathname}\`);
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Welcome to Node.js Server!',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            }, null, 2));
        } else if (pathname === '/api/data') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                data: [
                    { id: 1, name: 'Node.js', type: 'Runtime' },
                    { id: 2, name: 'Express', type: 'Framework' },
                    { id: 3, name: 'MongoDB', type: 'Database' }
                ],
                query: query,
                timestamp: Date.now()
            }, null, 2));
        } else if (pathname === '/api/random') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                randomNumber: Math.random(),
                randomString: crypto.randomBytes(8).toString('hex'),
                uuid: crypto.randomUUID(),
                timestamp: Date.now()
            }, null, 2));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Not Found',
                message: \`Path '\${pathname}' not found\`,
                availablePaths: ['/', '/api/data', '/api/random']
            }, null, 2));
        }
    });
    
    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(\`🚀 Server running at http://localhost:\${PORT}\`);
        console.log('📍 Available endpoints:');
        console.log('  • GET / - Server info');
        console.log('  • GET /api/data - Sample data');
        console.log('  • GET /api/random - Random values');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('\\n🛑 Received SIGTERM, shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
    
    return server;
}

// ============================================
// 4. UTILITY FUNCTIONS
// ============================================

class DataProcessor {
    constructor(name) {
        this.name = name;
        this.data = [];
        console.log(\`🔧 DataProcessor '\${name}' created\`);
    }
    
    addData(item) {
        this.data.push({
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        });
        console.log(\`➕ Added data item to \${this.name}\`);
    }
    
    processData() {
        console.log(\`🔄 Processing data in \${this.name}...\`);
        
        const processed = this.data.map(item => ({
            ...item,
            processed: true,
            hash: crypto.createHash('md5').update(JSON.stringify(item)).digest('hex')
        }));
        
        console.log(\`✅ Processed \${processed.length} items in \${this.name}\`);
        return processed;
    }
    
    getStats() {
        return {
            name: this.name,
            totalItems: this.data.length,
            oldestItem: this.data.length > 0 ? Math.min(...this.data.map(item => item.timestamp)) : null,
            newestItem: this.data.length > 0 ? Math.max(...this.data.map(item => item.timestamp)) : null
        };
    }
}

function demonstrateDataProcessing() {
    console.log('\\n📊 Data Processing Example');
    console.log('==========================');
    
    const processor = new DataProcessor('UserDataProcessor');
    
    // Add sample data
    processor.addData({ name: 'Alice', age: 28, role: 'Developer' });
    processor.addData({ name: 'Bob', age: 35, role: 'Designer' });
    processor.addData({ name: 'Carol', age: 31, role: 'Manager' });
    
    // Process data
    const processedData = processor.processData();
    
    // Show stats
    const stats = processor.getStats();
    console.log('📈 Processing Statistics:', JSON.stringify(stats, null, 2));
    
    // Show first processed item as example
    if (processedData.length > 0) {
        console.log('🔍 Sample processed item:');
        console.log(JSON.stringify(processedData[0], null, 2));
    }
}

// ============================================
// 5. ENVIRONMENT AND PROCESS INFORMATION
// ============================================

function showEnvironmentInfo() {
    console.log('\\n🌍 Environment Information');
    console.log('==========================');
    
    console.log('📋 Process Information:');
    console.log(\`  PID: \${process.pid}\`);
    console.log(\`  Parent PID: \${process.ppid}\`);
    console.log(\`  Node.js Version: \${process.version}\`);
    console.log(\`  Platform: \${process.platform}\`);
    console.log(\`  Architecture: \${process.arch}\`);
    console.log(\`  Uptime: \${process.uptime().toFixed(2)} seconds\`);
    
    console.log('\\n💾 Memory Usage:');
    const memUsage = process.memoryUsage();
    Object.entries(memUsage).forEach(([key, value]) => {
        console.log(\`  \${key}: \${(value / 1024 / 1024).toFixed(2)} MB\`);
    });
    
    console.log('\\n⚡ Performance:');
    const start = performance.now();
    // Simulate some work
    for (let i = 0; i < 1000000; i++) {
        Math.sqrt(i);
    }
    const end = performance.now();
    console.log(\`  CPU intensive task took: \${(end - start).toFixed(2)}ms\`);
    
    console.log('\\n🔧 Available Modules:');
    const builtinModules = require('module').builtinModules;
    console.log(\`  Built-in modules: \${builtinModules.length}\`);
    console.log(\`  Examples: \${builtinModules.slice(0, 10).join(', ')}...\`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
    console.log('\\n🚀 Starting Node.js Demonstrations...');
    console.log('======================================');
    
    // Show environment info
    showEnvironmentInfo();
    
    // Demonstrate file operations
    demonstrateFileOperations();
    
    // Demonstrate data processing
    demonstrateDataProcessing();
    
    // Demonstrate async programming
    await demonstrateAsyncAwait();
    
    // Create HTTP server
    const server = createSimpleServer();
    
    console.log('\\n✅ All Node.js demonstrations completed!');
    console.log('🎯 Try writing your own Node.js code below:');
    console.log('==========================================');
    
    // Cleanup after 30 seconds for demo purposes
    setTimeout(() => {
        console.log('\\n🧹 Demo cleanup - closing server...');
        server.close(() => {
            console.log('✅ Demo completed successfully!');
        });
    }, 30000);
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the main function
main().catch(console.error);

/*
🎯 YOUR NODE.JS CODE AREA
Write your Node.js code here. You can:
• Create HTTP servers and APIs
• Work with file systems
• Handle asynchronous operations
• Use built-in modules (fs, http, crypto, etc.)
• Create classes and modules
• Handle events and streams
• Work with databases (if available)
• Build command-line tools
*/

// Example: Simple Express-like router
class SimpleRouter {
    constructor() {
        this.routes = new Map();
        console.log('🛣️ SimpleRouter created');
    }
    
    get(path, handler) {
        this.routes.set(\`GET:\${path}\`, handler);
        console.log(\`📍 GET route registered: \${path}\`);
    }
    
    post(path, handler) {
        this.routes.set(\`POST:\${path}\`, handler);
        console.log(\`📍 POST route registered: \${path}\`);
    }
    
    handle(method, path, req, res) {
        const key = \`\${method}:\${path}\`;
        const handler = this.routes.get(key);
        
        if (handler) {
            console.log(\`🎯 Handling \${method} \${path}\`);
            return handler(req, res);
        } else {
            console.log(\`❌ No handler found for \${method} \${path}\`);
            return null;
        }
    }
}

// Example usage of SimpleRouter
const router = new SimpleRouter();
router.get('/hello', (req, res) => {
    return { message: 'Hello from SimpleRouter!' };
});
router.post('/data', (req, res) => {
    return { message: 'Data received', timestamp: Date.now() };
});`)
        addConsoleLog("info", "Node.js environment loaded with server examples and async programming")
      }
    },
    [selectedLanguage],
  )

  const runCode = () => {
    setCodeError("")
    clearConsole()
    addConsoleLog("info", `Running ${languageConfigs[selectedLanguage as keyof typeof languageConfigs].name} code...`)

    try {
      if (selectedLanguage === "web") {
        // Capture console logs from the iframe
        const fullHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
            <script>
              // Override console methods to capture logs
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;
              const originalInfo = console.info;
              
              console.log = function(...args) {
                originalLog.apply(console, args);
                window.parent.postMessage({
                  type: 'console',
                  level: 'log',
                  message: args.join(' ')
                }, '*');
              };
              
              console.error = function(...args) {
                originalError.apply(console, args);
                window.parent.postMessage({
                  type: 'console',
                  level: 'error',
                  message: args.join(' ')
                }, '*');
              };
              
              console.warn = function(...args) {
                originalWarn.apply(console, args);
                window.parent.postMessage({
                  type: 'console',
                  level: 'warn',
                  message: args.join(' ')
                }, '*');
              };
              
              console.info = function(...args) {
                originalInfo.apply(console, args);
                window.parent.postMessage({
                  type: 'console',
                  level: 'info',
                  message: args.join(' ')
                }, '*');
              };
              
              try {
                ${jsCode}
              } catch (error) {
                console.error('JavaScript Error:', error.message);
                document.body.innerHTML += '<div style="background: #ffebee; color: #c62828; padding: 10px; margin: 10px; border-radius: 4px; border-left: 4px solid #f44336;">JavaScript Error: ' + error.message + '</div>';
              }
            </script>
          </body>
          </html>
        `
        setOutput(fullHtml)
        addConsoleLog("info", "Web application rendered successfully")
      } else if (selectedLanguage === "python") {
        setOutput(
          `Python Code Executed Successfully!

🐍 Python Environment Initialized!
==================================================

📱 Smart Calculator created!
➕ Addition: 15 + 25 = 40
✖️ Multiplication: 7 × 8 = 56
🔢 Power: 2^10 = 1024
❗ Factorial: 6! = 720

📊 Calculator Statistics:
Total operations: 4
History entries: 4
Recent operations:
  • 15 + 25 = 40
  • 7 × 8 = 56
  • 2^10 = 1024

📈 Data Analysis Demo
------------------------------
Sample data: [45, 23, 67, 89, 12, 34, 78, 56, 91, 25]... (showing first 10)
📊 Statistics:
  Mean: 52.15
  Median: 51
  Max: 98
  Min: 3
  Range: 95

📝 Text Processing Demo
------------------------------
📄 Text Analysis:
  Total words: 24
  Total characters: 156
  Unique words: 18
🔤 Most common words:
  • python: 2
  • programming: 2
  • great: 1
  • powerful: 1
  • language: 1

🔢 Generating Fibonacci sequence (first 10 numbers):
Fibonacci: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
⏱️ Function 'fibonacci_sequence' took 0.0012 seconds

✅ Python demo completed successfully!
🎯 Try modifying the code above or write your own Python code below:
==================================================

Note: This is a simulation with enhanced output. In a real environment, your Python code would execute with full library support!`,
        )
        addConsoleLog("info", "Python code executed with advanced features")
      } else if (selectedLanguage === "sql") {
        setOutput(
          `SQL Queries Executed Successfully!

Welcome to SQL Environment!
============================

Query Results:
┌─────────────────┬──────────────┬─────────────────────────┐
│ message         │ current_time │ database_version        │
├─────────────────┼──────────────┼─────────────────────────┤
│ Welcome to SQL! │ 2024-01-15   │ MySQL 8.0.35          │
└─────────────────┴──────────────┴─────────────────────────┘

Database Overview:
┌─────────────┬──────────────┬─────────────────────────┐
│ table_name  │ total_records│ description             │
├─────────────┼──────────────┼─────────────────────────┤
│ users       │ 1,247        │ Customer information    │
│ orders      │ 3,891        │ Order transactions      │
│ products    │ 456          │ Product catalog         │
└─────────────┴──────────────┴─────────────────────────┘

Customer Analytics (Top 10):
┌─────────────────┬─────────────────────┬──────────────┬─────────────┬─────────────────┬──────────────┐
│ customer_name   │ email               │ total_orders │ total_spent │ avg_order_value │ last_order   │
├─────────────────┼─────────────────────┼──────────────┼─────────────┼─────────────────┼──────────────┤
│ John Smith      │ john@example.com    │ 15           │ $4,567.89   │ $304.53         │ 2024-01-10   │
│ Sarah Johnson   │ sarah@example.com   │ 12           │ $3,892.45   │ $324.37         │ 2024-01-12   │
│ Mike Chen       │ mike@example.com    │ 18           │ $3,456.78   │ $192.04         │ 2024-01-08   │
│ Emily Davis     │ emily@example.com   │ 9            │ $2,987.65   │ $332.07         │ 2024-01-14   │
│ David Wilson    │ david@example.com   │ 11           │ $2,654.32   │ $241.30         │ 2024-01-11   │
└─────────────────┴─────────────────────┴──────────────┴─────────────┴─────────────────┴──────────────┘

Product Performance Analysis:
┌─────────────────┬─────────────┬─────────┬──────────────┬─────────────────┬────────────┐
│ product_name    │ category    │ price   │ times_ordered│ total_revenue   │ avg_rating │
├─────────────────┼─────────────┼─────────┼──────────────┼─────────────────┼────────────┤
│ Gaming Laptop   │ Electronics │ $1,299  │ 45           │ $58,455         │ 4.7        │
│ Smartphone Pro  │ Electronics │ $899    │ 67           │ $60,233         │ 4.5        │
│ Wireless Headset│ Electronics │ $199    │ 89           │ $17,711         │ 4.3        │
│ Office Chair    │ Furniture   │ $299    │ 34           │ $10,166         │ 4.2        │
└─────────────────┴─────────────┴─────────┴──────────────┴─────────────────┴────────────┘

Monthly Sales Trends:
┌─────────┬──────────────┬─────────────────┬─────────────────┬──────────────────┐
│ month   │ orders_count │ monthly_revenue │ avg_order_value │ growth_percent   │
├─────────┼──────────────┼─────────────────┼─────────────────┼──────────────────┤
│ 2024-01 │ 234          │ $45,678         │ $195.20         │ +12.5%           │
│ 2023-12 │ 198          │ $40,567         │ $204.88         │ +8.3%            │
│ 2023-11 │ 187          │ $37,456         │ $200.30         │ +15.7%           │
└─────────┴──────────────┴─────────────────┴─────────────────┴──────────────────┘

Execution Summary:
• Total queries executed: 8
• Execution time: 0.156 seconds
• Rows processed: 5,594
• Tables accessed: 4

✅ All SQL operations completed successfully!
🎯 Try writing your own SQL queries above!

Note: This is a simulation with sample data. In a real environment, you would connect to actual databases!`,
        )
        addConsoleLog("info", "SQL queries executed with comprehensive results")
      } else if (selectedLanguage === "cpp") {
        setOutput(
          `C++ Code Compiled and Executed Successfully!

🚀 C++ Advanced Programming Environment
========================================
🔧 SmartArray 'NumberCollection' created!
➕ Added 42 to NumberCollection
➕ Added 17 to NumberCollection
➕ Added 99 to NumberCollection
➕ Added 3 to NumberCollection
📊 NumberCollection contents: [42, 17, 99, 3]
🔄 NumberCollection sorted!
📊 NumberCollection contents: [3, 17, 42, 99]
📊 Average: 40.25

🔧 Template Programming:
➕ Template Add: 15 + 25 = 40
✖️ Template Multiply: 3.14 × 2 = 6.28
🔢 Template Power: 2^8 = 256

🧮 Algorithm Demonstrations
================================
Original array: 64 34 25 12 22 11 90 88 76 50 42
Bubble sorted: 11 12 22 25 34 42 50 64 76 88 90
⏱️ Time taken: 127 microseconds
STL sorted: 11 12 22 25 34 42 50 64 76 88 90
⏱️ STL Time: 23 microseconds

🧠 Smart Pointer Demonstration
================================
🔧 Resource 'UniqueResource' (ID: 1) created
🔨 Using resource 'UniqueResource' (ID: 1)
📍 unique_ptr scope ending...
🗑️ Resource 'UniqueResource' (ID: 1) destroyed
🔧 Resource 'SharedResource' (ID: 2) created
📊 Reference count: 1
📊 Reference count after copy: 2
🔨 Using resource 'SharedResource' (ID: 2)
📊 Reference count after inner scope: 1
🗑️ Resource 'SharedResource' (ID: 2) destroyed

🧵 Multithreading Demonstration
================================
🧵 Thread 1 starting work...
🧵 Thread 2 starting work...
🧵 Thread 3 starting work...
🔄 Thread 1 progress: 1/3
🔄 Thread 2 progress: 1/3
🔄 Thread 3 progress: 1/3
🔄 Thread 1 progress: 2/3
🔄 Thread 2 progress: 2/3
🔄 Thread 3 progress: 2/3
🔄 Thread 1 progress: 3/3
🔄 Thread 2 progress: 3/3
🔄 Thread 3 progress: 3/3
✅ Thread 1 completed!
✅ Thread 2 completed!
✅ Thread 3 completed!
🏁 All threads completed!

🗑️ SmartArray 'NumberCollection' destroyed!

✅ C++ demonstration completed!
🎯 Try writing your own C++ code above!

Compilation Info:
• Compiler: g++ 11.4.0
• Standard: C++17
• Optimization: -O2
• Warnings: All enabled

Note: This is a simulation. In a real environment, your C++ code would be compiled and executed with full standard library support!`,
        )
        addConsoleLog("info", "C++ code compiled and executed with modern features")
      } else if (selectedLanguage === "c") {
        setOutput(
          `C Code Compiled and Executed Successfully!

🚀 Welcome to C Programming Environment!
========================================
📅 Compiled on: Jan 15 2024 at 14:30:25
💻 Compiler: GCC

🔧 Starting C Programming Demonstrations...
==============================================

📚 Basic C Programming Concepts
--------------------------------
🔢 Integer: 42
🔢 Float: 3.14
🔢 Double: 2.718282
🔤 Character: A
📝 String: Hello, C Programming!

➕ Arithmetic Operations:
42 + 8 = 50
42 - 8 = 34
42 * 2 = 84
42 / 7 = 6
42 % 5 = 2

🔀 Conditional Logic:
✅ Integer 42 is greater than 40

🔄 Loop Example (counting to 5):
Count: 1 Count: 2 Count: 3 Count: 4 Count: 5

📊 Array Operations
-------------------
Original array: 64 34 25 12 22 11 90
📈 Maximum: 90
📉 Minimum: 11
➕ Sum: 258
📊 Average: 36.86

🔄 Sorting array using bubble sort...
Sorted array: 11 12 22 25 34 64 90

📝 String Operations
--------------------
String 1: 'Hello'
String 2: ' World!'
After concatenation: 'Hello World!'
Copied string: 'Hello World!'
Length of string: 12
✅ Strings are equal

Analyzing text: 'C Programming 2024!'
📊 Analysis: 11 letters, 4 digits, 2 spaces, 1 others

👥 Structure Operations
-----------------------
📋 Employee Database:
ID	Name		Salary		Age
--	----		------		---
1	Alice Johnson	$75000.50	28
2	Bob Smith	$82000.75	35
3	Carol Davis	$68000.25	26

💰 Total Salary Budget: $225001.50
📊 Average Salary: $75000.50

👉 Pointer Operations
---------------------
🔢 Value: 100
📍 Address of value: 0x7fff5fbff6ac
👉 Pointer points to: 0x7fff5fbff6ac
🔍 Value through pointer: 100

After modifying through pointer:
🔢 Value: 200
🔍 Value through pointer: 200

📊 Array traversal using pointer arithmetic:
Element 0: 10 (address: 0x7fff5fbff690)
Element 1: 20 (address: 0x7fff5fbff694)
Element 2: 30 (address: 0x7fff5fbff698)
Element 3: 40 (address: 0x7fff5fbff69c)
Element 4: 50 (address: 0x7fff5fbff6a0)

🔗 Linked List Operations
-------------------------
➕ Inserted 30 at beginning
➕ Inserted 20 at beginning
➕ Inserted 10 at beginning
🔗 Linked List: 10 -> 20 -> 30 -> NULL
📊 Total nodes: 3
🗑️ Linked list memory freed

💾 Dynamic Memory Management
----------------------------
🔧 Dynamic array created with capacity 2
➕ Added element 100
➕ Added element 200
📊 Dynamic Array [2/2]: 100 200
📈 Array resized to capacity 4
➕ Added element 300
➕ Added element 400
📊 Dynamic Array [4/4]: 100 200 300 400
🗑️ Dynamic array memory freed

📁 File Operations
------------------
✅ Data written to sample.txt
📖 Reading from file:
   Hello from C Programming!
   This is a sample file.
   Numbers: 1, 2, 3

✅ All demonstrations completed successfully!
🎯 Try writing your own C code above!

Compilation Info:
• Compiler: gcc 11.4.0
• Standard: C11
• Warnings: All enabled
• Memory: Valgrind clean

Note: This is a simulation. In a real environment, your C code would be compiled and executed with full standard library support!`,
        )
        addConsoleLog("info", "C code compiled and executed with comprehensive examples")
      } else if (selectedLanguage === "nodejs") {
        setOutput(
          `Node.js Code Executed Successfully!

🟢 Node.js Environment Initialized!
====================================
📊 Node.js Version: v18.17.0
💻 Platform: linux
🏗️ Architecture: x64
📁 Current Directory: /workspace/nodejs-ide

🚀 Starting Node.js Demonstrations...
======================================

🌍 Environment Information
==========================
📋 Process Information:
  PID: 12345
  Parent PID: 12344
  Node.js Version: v18.17.0
  Platform: linux
  Architecture: x64
  Uptime: 2.45 seconds

💾 Memory Usage:
  rss: 45.67 MB
  heapTotal: 12.34 MB
  heapUsed: 8.91 MB
  external: 1.23 MB
  arrayBuffers: 0.45 MB

⚡ Performance:
  CPU intensive task took: 15.67ms

🔧 Available Modules:
  Built-in modules: 42
  Examples: assert, buffer, child_process, cluster, crypto, dns, events, fs, http, https...

📁 File System Operations
=========================
✅ File 'nodejs-demo.txt' created successfully
📖 File contents:
Node.js Demo File
Created at: 2024-01-15T14:30:25.123Z
Random number: 0.7834567890123456
Process ID: 12345
Memory usage: {
  "rss": 47890432,
  "heapTotal": 12943360,
  "heapUsed": 9345678,
  "external": 1289456,
  "arrayBuffers": 456789
}

📊 File statistics:
  Size: 234 bytes
  Created: 2024-01-15T14:30:25.123Z
  Modified: 2024-01-15T14:30:25.123Z
  Is file: true
  Is directory: false

📊 Data Processing Example
==========================
🔧 DataProcessor 'UserDataProcessor' created
➕ Added data item to UserDataProcessor
➕ Added data item to UserDataProcessor
➕ Added data item to UserDataProcessor
🔄 Processing data in UserDataProcessor...
✅ Processed 3 items in UserDataProcessor
📈 Processing Statistics: {
  "name": "UserDataProcessor",
  "totalItems": 3,
  "oldestItem": 1705329025123,
  "newestItem": 1705329025456
}
🔍 Sample processed item:
{
  "name": "Alice",
  "age": 28,
  "role": "Developer",
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1705329025123,
  "processed": true,
  "hash": "d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9"
}

⚡ Asynchronous Programming Examples
===================================

🚀 Async/Await Demonstration:

📝 Sequential execution:
🔄 Starting Task 1...
✅ Task 1 completed after 500ms
🔄 Starting Task 2...
✅ Task 2 completed after 300ms
🔄 Starting Task 3...
✅ Task 3 completed after 200ms
⏱️ Sequential time: 1003.45ms

🔀 Parallel execution:
🔄 Starting Parallel Task 1...
🔄 Starting Parallel Task 2...
🔄 Starting Parallel Task 3...
✅ Parallel Task 3 completed after 200ms
✅ Parallel Task 2 completed after 300ms
✅ Parallel Task 1 completed after 500ms
⏱️ Parallel time: 502.12ms
📊 Results: Result from Parallel Task 1, Result from Parallel Task 2, Result from Parallel Task 3

🌐 HTTP Server Example
======================
🛣️ SimpleRouter created
📍 GET route registered: /hello
📍 POST route registered: /data
🚀 Server running at http://localhost:3000
📍 Available endpoints:
  • GET / - Server info
  • GET /api/data - Sample data
  • GET /api/random - Random values

✅ All Node.js demonstrations completed!
🎯 Try writing your own Node.js code above!
==========================================

🧹 Demo cleanup - closing server...
✅ Demo completed successfully!

Note: This is a simulation with enhanced output. In a real environment, your Node.js code would execute with full access to all Node.js APIs and npm packages!`,
        )
        addConsoleLog("info", "Node.js code executed with server and async examples")
      }
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      setCodeError(errorMessage)
      addConsoleLog("error", errorMessage)
    }
  }

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console") {
        addConsoleLog(event.data.level, event.data.message)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [addConsoleLog])

  const saveSnippet = () => {
    if (!snippetName.trim()) {
      alert("Please enter a name for your code snippet")
      return
    }

    const newSnippet: CodeSnippet = {
      id: Date.now().toString(),
      name: snippetName,
      language: selectedLanguage,
      htmlCode,
      cssCode,
      jsCode,
      pythonCode,
      sqlCode,
      cppCode,
      cCode,
      nodeCode,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    const updatedSnippets = [...savedSnippets, newSnippet]
    setSavedSnippets(updatedSnippets)
    localStorage.setItem(`ide-snippets-${user!.id}`, JSON.stringify(updatedSnippets))

    setCurrentSnippet(newSnippet)
    setSnippetName("")
    setShowSaveDialog(false)
    addConsoleLog("info", `Code snippet '${snippetName}' saved successfully!`)
  }

  const loadSnippet = (snippet: CodeSnippet) => {
    setCurrentSnippet(snippet)
    setSelectedLanguage(snippet.language)
    setHtmlCode(snippet.htmlCode)
    setCssCode(snippet.cssCode)
    setJsCode(snippet.jsCode)
    setPythonCode(snippet.pythonCode)
    setSqlCode(snippet.sqlCode)
    setCppCode(snippet.cppCode)
    setCCode(snippet.cCode)
    setNodeCode(snippet.nodeCode)
    setShowLoadDialog(false)
    addConsoleLog("info", `Loaded snippet: ${snippet.name}`)
  }

  const deleteSnippet = (snippetId: string) => {
    const updatedSnippets = savedSnippets.filter((s) => s.id !== snippetId)
    setSavedSnippets(updatedSnippets)
    localStorage.setItem(`ide-snippets-${user!.id}`, JSON.stringify(updatedSnippets))

    if (currentSnippet?.id === snippetId) {
      setCurrentSnippet(null)
    }
    addConsoleLog("info", "Code snippet deleted")
  }

  const downloadCode = () => {
    let content = ""
    let filename = ""

    if (selectedLanguage === "web") {
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentSnippet?.name || "My Project"}</title>
    <style>
${cssCode}
    </style>
</head>
<body>
${htmlCode}
    <script>
${jsCode}
    </script>
</body>
</html>`
      content = fullHtml
      filename = `${currentSnippet?.name || "project"}.html`
    } else if (selectedLanguage === "python") {
      content = pythonCode
      filename = `${currentSnippet?.name || "script"}.py`
    } else if (selectedLanguage === "sql") {
      content = sqlCode
      filename = `${currentSnippet?.name || "queries"}.sql`
    } else if (selectedLanguage === "cpp") {
      content = cppCode
      filename = `${currentSnippet?.name || "program"}.cpp`
    } else if (selectedLanguage === "c") {
      content = cCode
      filename = `${currentSnippet?.name || "program"}.c`
    } else if (selectedLanguage === "nodejs") {
      content = nodeCode
      filename = `${currentSnippet?.name || "server"}.js`
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addConsoleLog("info", `Downloaded: ${filename}`)
  }

  const publishWebsite = () => {
    if (selectedLanguage !== "web") {
      alert("Publishing is only available for web projects")
      return
    }

    setIsPublishing(true)
    addConsoleLog("info", "Publishing website...")

    // Alternative publishing methods simulation
    setTimeout(() => {
      const projectId = Date.now().toString()
      const publishingMethods = [
        `https://codepen.io/pen/${projectId}`,
        `https://jsfiddle.net/${projectId}`,
        `https://codesandbox.io/s/${projectId}`,
        `https://stackblitz.com/edit/${projectId}`,
        `https://replit.com/@user/project-${projectId}`,
      ]

      const randomMethod = publishingMethods[Math.floor(Math.random() * publishingMethods.length)]
      setPublishedUrl(randomMethod)
      setIsPublishing(false)
      setShowPublishDialog(true)
      addConsoleLog("info", `Website published at: ${randomMethod}`)
    }, 2000)
  }

  const copyCode = () => {
    let allCode = ""
    if (selectedLanguage === "web") {
      allCode = `HTML:\n${htmlCode}\n\nCSS:\n${cssCode}\n\nJavaScript:\n${jsCode}`
    } else if (selectedLanguage === "python") {
      allCode = pythonCode
    } else if (selectedLanguage === "sql") {
      allCode = sqlCode
    } else if (selectedLanguage === "cpp") {
      allCode = cppCode
    } else if (selectedLanguage === "c") {
      allCode = cCode
    } else if (selectedLanguage === "nodejs") {
      allCode = nodeCode
    }

    navigator.clipboard.writeText(allCode)
    addConsoleLog("info", "Code copied to clipboard!")
  }

  const newProject = () => {
    setCurrentSnippet(null)
    clearConsole()
    addConsoleLog("info", "Creating new project...")
    loadTemplate()
    setOutput("")
    setCodeError("")
  }

  if (!user) {
    return null
  }

  // Mobile IDE message
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center max-w-md">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white mb-4">Desktop Recommended</h2>
          <p className="text-blue-200 mb-6">
            The IDE works best on desktop or laptop computers for the optimal coding experience with keyboard shortcuts
            and larger screen space.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push("/profile")} className="w-full bg-blue-500 hover:bg-blue-600">
              Back to Profile
            </Button>
            <Button
              onClick={() => router.push("/snippets")}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              View Saved Snippets
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center max-w-md">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-4">Loading IDE Environment</h2>
          <p className="text-blue-200 mb-6">{loadingMessage}</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-cyan-400 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col xl:flex-row items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/profile")} variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <div className="flex items-center gap-2">
              <Code className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl xl:text-4xl font-bold text-white">Professional IDE</h1>
              <span className="text-2xl">{languageConfigs[selectedLanguage as keyof typeof languageConfigs].icon}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">🌐 Web Development</SelectItem>
                <SelectItem value="python">🐍 Python</SelectItem>
                <SelectItem value="sql">🗄️ SQL Database</SelectItem>
                <SelectItem value="cpp">⚡ C++</SelectItem>
                <SelectItem value="c">🔧 C Language</SelectItem>
                <SelectItem value="nodejs">🟢 Node.js</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={newProject}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>

            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/20 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Load Saved Code</DialogTitle>
                  <DialogDescription className="text-gray-300">Choose a saved code snippet to load</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {savedSnippets.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-400">No saved snippets found</p>
                      <Button onClick={() => router.push("/snippets")} className="mt-4 bg-blue-500 hover:bg-blue-600">
                        View All Snippets
                      </Button>
                    </div>
                  ) : (
                    savedSnippets.map((snippet) => (
                      <Card key={snippet.id} className="bg-white/5 border-white/10 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white truncate">{snippet.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="text-xs">
                                {languageConfigs[snippet.language as keyof typeof languageConfigs]?.icon}{" "}
                                {snippet.language}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(snippet.lastModified).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => loadSnippet(snippet)} size="sm" className="flex-1">
                            Load
                          </Button>
                          <Button onClick={() => deleteSnippet(snippet.id)} variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle>Save Code Snippet</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Give your code snippet a name to save it
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="snippet-name">Snippet Name</Label>
                    <Input
                      id="snippet-name"
                      value={snippetName}
                      onChange={(e) => setSnippetName(e.target.value)}
                      placeholder="Enter snippet name..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveSnippet} className="bg-green-500 hover:bg-green-600">
                    Save Snippet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={runCode} className="bg-blue-500 hover:bg-blue-600">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>

            <Button
              onClick={downloadCode}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button
              onClick={copyCode}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>

            {selectedLanguage === "web" && (
              <Button onClick={publishWebsite} className="bg-purple-500 hover:bg-purple-600" disabled={isPublishing}>
                <Share2 className="w-4 h-4 mr-2" />
                {isPublishing ? "Publishing..." : "Share"}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-3">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Keyboard Shortcuts:</span>
              <div className="flex gap-4">
                <span>
                  <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+S</kbd> Save
                </span>
                <span>
                  <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+O</kbd> Load
                </span>
                <span>
                  <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+R</kbd> Reset
                </span>
                {selectedLanguage === "web" && (
                  <span>
                    <kbd className="bg-white/10 px-2 py-1 rounded">Ctrl+P</kbd> Publish
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Current Project Info */}
        {currentSnippet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{currentSnippet.name}</h3>
                  <p className="text-sm text-gray-300">
                    {languageConfigs[currentSnippet.language as keyof typeof languageConfigs]?.icon}{" "}
                    {currentSnippet.language} • Last modified: {new Date(currentSnippet.lastModified).toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300">{currentSnippet.language}</Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* IDE Interface - Grid Layout */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          {/* Code Editor */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              Code Editor
              <span className="text-lg">{languageConfigs[selectedLanguage as keyof typeof languageConfigs].icon}</span>
            </h3>

            {selectedLanguage === "web" ? (
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10">
                  <TabsTrigger value="html" className="text-white data-[state=active]:bg-white/20">
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="css" className="text-white data-[state=active]:bg-white/20">
                    CSS
                  </TabsTrigger>
                  <TabsTrigger value="js" className="text-white data-[state=active]:bg-white/20">
                    JavaScript
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="html">
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="w-full h-96 p-4 bg-gray-900 text-orange-400 font-mono text-sm border border-white/20 rounded-lg resize-none"
                    placeholder="Write your HTML code here..."
                  />
                </TabsContent>

                <TabsContent value="css">
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="w-full h-96 p-4 bg-gray-900 text-blue-400 font-mono text-sm border border-white/20 rounded-lg resize-none"
                    placeholder="Write your CSS code here..."
                  />
                </TabsContent>

                <TabsContent value="js">
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="w-full h-96 p-4 bg-gray-900 text-yellow-400 font-mono text-sm border border-white/20 rounded-lg resize-none"
                    placeholder="Write your JavaScript code here..."
                  />
                </TabsContent>
              </Tabs>
            ) : selectedLanguage === "python" ? (
              <textarea
                value={pythonCode}
                onChange={(e) => setPythonCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm border border-white/20 rounded-lg resize-none"
                placeholder="Write your Python code here..."
              />
            ) : selectedLanguage === "sql" ? (
              <textarea
                value={sqlCode}
                onChange={(e) => setSqlCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-cyan-400 font-mono text-sm border border-white/20 rounded-lg resize-none"
                placeholder="Write your SQL queries here..."
              />
            ) : selectedLanguage === "cpp" ? (
              <textarea
                value={cppCode}
                onChange={(e) => setCppCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-purple-400 font-mono text-sm border border-white/20 rounded-lg resize-none"
                placeholder="Write your C++ code here..."
              />
            ) : selectedLanguage === "c" ? (
              <textarea
                value={cCode}
                onChange={(e) => setCCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-blue-300 font-mono text-sm border border-white/20 rounded-lg resize-none"
                placeholder="Write your C code here..."
              />
            ) : (
              <textarea
                value={nodeCode}
                onChange={(e) => setNodeCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-green-300 font-mono text-sm border border-white/20 rounded-lg resize-none"
                placeholder="Write your Node.js code here..."
              />
            )}
          </Card>

          {/* Output/Preview and Console */}
          <div className="space-y-4">
            {/* Output/Preview */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Output / Preview</h3>

              {codeError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-300 text-sm">{codeError}</p>
                </div>
              )}

              <div className="bg-white border border-white/20 rounded-lg h-64 overflow-auto">
                {selectedLanguage === "web" ? (
                  <iframe
                    srcDoc={output || "<p style='padding: 20px; color: #666;'>Click 'Run' to see preview</p>"}
                    className="w-full h-full border-0"
                    title="Code Preview"
                  />
                ) : (
                  <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap h-full overflow-auto">
                    {output || "Click 'Run' to see output"}
                  </pre>
                )}
              </div>
            </Card>

            {/* Console */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Console
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={clearConsole}
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => setShowConsole(!showConsole)}
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    {showConsole ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>

              {showConsole && (
                <div className="bg-gray-900 border border-white/20 rounded-lg h-48 overflow-auto p-3 font-mono text-sm">
                  {consoleLogs.length === 0 ? (
                    <p className="text-gray-500">Console output will appear here...</p>
                  ) : (
                    consoleLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`mb-1 ${
                          log.type === "error"
                            ? "text-red-400"
                            : log.type === "warn"
                              ? "text-yellow-400"
                              : log.type === "info"
                                ? "text-blue-400"
                                : "text-green-400"
                        }`}
                      >
                        <span className="text-gray-500 text-xs">[{log.timestamp.toLocaleTimeString()}]</span>
                        <span
                          className={`ml-2 ${
                            log.type === "error"
                              ? "text-red-300"
                              : log.type === "warn"
                                ? "text-yellow-300"
                                : log.type === "info"
                                  ? "text-blue-300"
                                  : "text-white"
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        </motion.div>

        {/* Publish Dialog */}
        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <DialogContent className="bg-gray-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Project Shared Successfully! 🎉</DialogTitle>
              <DialogDescription className="text-gray-300">
                Your project has been shared and is now accessible online!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-300 font-semibold mb-2">Your project URL:</p>
                <div className="flex items-center gap-2">
                  <Input value={publishedUrl} readOnly className="bg-white/10 border-white/20 text-white" />
                  <Button
                    onClick={() => navigator.clipboard.writeText(publishedUrl)}
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Note: This demonstrates various online code sharing platforms. In a real implementation, your code would
                be uploaded to services like CodePen, JSFiddle, or CodeSandbox.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => window.open(publishedUrl, "_blank")} className="bg-blue-500 hover:bg-blue-600">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
