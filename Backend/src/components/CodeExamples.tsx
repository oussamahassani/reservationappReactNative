
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';

const CodeExamples = () => {
  const [activeTab, setActiveTab] = useState(0);

  const codeExamples = [
    {
      title: 'Memory Safety',
      code: `fn main() {
    // Safe code with ownership system
    let s1 = String::from("hello");
    
    // This would cause error in Rust
    // let s2 = s1; // value moved here
    // println!("{}", s1); // value used here after move
    
    // Proper way to clone if needed
    let s2 = s1.clone();
    println!("s1: {}, s2: {}", s1, s2); // Both valid!
}`,
      explanation: 'Rust prevents memory errors by tracking ownership of values. When a value is assigned to another variable, the original variable can no longer be used unless the value is explicitly cloned.'
    },
    {
      title: 'Concurrency',
      code: `use std::thread;

fn main() {
    let mut handles = vec![];
    
    for i in 0..10 {
        let handle = thread::spawn(move || {
            println!("Thread {} says hello!", i);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("All threads completed!");
}`,
      explanation: 'Rust makes concurrent programming safer with its ownership and type systems. The compiler prevents data races at compile time.'
    },
    {
      title: 'Error Handling',
      code: `fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        return Err(String::from("Cannot divide by zero"));
    }
    Ok(a / b)
}

fn main() {
    let result = divide(10.0, 2.0);
    
    match result {
        Ok(value) => println!("Result: {}", value),
        Err(error) => println!("Error: {}", error),
    }
    
    // Using the ? operator with Results
    fn process_division() -> Result<(), String> {
        let value = divide(20.0, 4.0)?;
        println!("Processed value: {}", value);
        Ok(())
    }
}`,
      explanation: 'Rust has no exceptions, instead using the Result type for recoverable errors. This forces explicit handling of error cases.'
    }
  ];

  return (
    <section id="code-examples" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center mb-4">
            <Code className="text-rust-orange mr-2" size={28} />
            <h2 className="text-3xl font-bold text-white">Learn by Example</h2>
          </div>
          <p className="text-gray-400 text-center max-w-2xl">
            See real-world Rust code examples and understand what makes Rust unique and powerful.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="lg:w-1/4 bg-gray-850">
            <div className="p-1">
              {codeExamples.map((example, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-4 transition-colors duration-200 ${
                    activeTab === index 
                      ? 'bg-rust-orange text-white' 
                      : 'text-gray-400 hover:bg-gray-700'
                  } rounded mb-1`}
                  onClick={() => setActiveTab(index)}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:w-3/4 p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">{codeExamples[activeTab].title}</h3>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
                <pre className="text-gray-300 font-mono">
                  <code>{codeExamples[activeTab].code}</code>
                </pre>
              </div>
              
              <div className="bg-gray-750 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Explanation:</h4>
                <p className="text-gray-400">{codeExamples[activeTab].explanation}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeExamples;
