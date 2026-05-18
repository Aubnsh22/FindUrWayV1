import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award, Brain, Code2, Database, Layers, CheckCircle2,
  AlertCircle, ChevronRight, HelpCircle, ArrowLeft, RefreshCw, Sparkles
} from 'lucide-react'
import { MatchRing } from '../components/ui/SharedUI.jsx'

// Curated 10-Question QCM pools across 5 main paths
const QUIZ_POOLS = {
  data_science: {
    title: "Data Science & Analysis",
    icon: Database,
    color: "#8DA4C4",
    questions: [
      {
        q: "What is the primary purpose of cross-validation in Machine Learning?",
        a: ["To reduce the training time of complex models", "To avoid overfitting and get a reliable estimation of model performance", "To cleanse missing values from datasets", "To increase model complexity"],
        c: 1
      },
      {
        q: "Which of the following is a primary metric to evaluate a classification model with highly imbalanced classes?",
        a: ["Mean Squared Error (MSE)", "Classification Accuracy", "F1-Score / Precision-Recall Curve", "R-squared"],
        c: 2
      },
      {
        q: "In Pandas, which function is used to pivot a DataFrame from wide format to long format?",
        a: ["pd.pivot()", "pd.melt()", "pd.concat()", "pd.merge()"],
        c: 1
      },
      {
        q: "What does the Random Forest algorithm use to create a diverse set of decision trees?",
        a: ["Backpropagation matrices", "Bagging (Bootstrap Aggregation) and feature randomness", "Stochastic Gradient Descent", "L1 Weight Regularization"],
        c: 1
      },
      {
        q: "What is the primary function of PCA (Principal Component Analysis)?",
        a: ["To select the single most important descriptive feature", "To project data onto orthogonal directions of maximum variance", "To cluster data points into K specific categories", "To train deep neural networks"],
        c: 1
      },
      {
        q: "Which objective function (loss) is minimized in standard Linear Regression?",
        a: ["Binary Cross-Entropy Loss", "Hinge Loss", "Mean Squared Error (MSE)", "Kullback-Leibler Divergence"],
        c: 2
      },
      {
        q: "In Scikit-Learn, which class is used to standardize features by removing the mean and scaling to unit variance?",
        a: ["MinMaxScaler", "StandardScaler", "Normalizer", "OneHotEncoder"],
        c: 1
      },
      {
        q: "What is a Type I error in statistical hypothesis testing?",
        a: ["Failing to reject a false null hypothesis (False Negative)", "Rejecting a true null hypothesis (False Positive)", "Increasing the sample size unnecessarily", "Using the wrong statistical test for the data"],
        c: 1
      },
      {
        q: "Which of the following algorithms is an unsupervised learning method used for clustering?",
        a: ["Logistic Regression", "Support Vector Machines (SVM)", "K-Means", "Gradient Boosting"],
        c: 2
      },
      {
        q: "What does an R-squared value of 0.85 imply in a regression model?",
        a: ["85% of predictions are exactly correct", "85% of the variance in the target variable is explained by the model", "The model is overfitted by 85%", "The error margin is exactly 15%"],
        c: 1
      }
    ]
  },
  ai_ml: {
    title: "AI & Machine Learning",
    icon: Brain,
    color: "#C59B93",
    questions: [
      {
        q: "Which activation function is commonly used in the output layer of a multi-class neural network classification task?",
        a: ["ReLU (Rectified Linear Unit)", "Sigmoid", "Tanh (Hyperbolic Tangent)", "Softmax"],
        c: 3
      },
      {
        q: "What is the primary purpose of the 'Dropout' layer in Deep Learning models?",
        a: ["To delete corrupted data points from batches", "To prevent overfitting by randomly setting input units to 0 during training", "To speed up calculation speeds on modern CPUs", "To dynamically increase the neural learning rate"],
        c: 1
      },
      {
        q: "In Natural Language Processing (NLP), what is the primary breakthrough of the Transformer architecture?",
        a: ["Using recurrent loops for sequential token reading", "The Self-Attention mechanism allowing parallel processing of tokens", "Deploying convolutional filters for local text analysis", "Eliminating word embeddings entirely"],
        c: 1
      },
      {
        q: "Which optimization algorithm uses moving averages of both the gradients and their squares (RMSprop + Momentum)?",
        a: ["Stochastic Gradient Descent (SGD)", "Adam (Adaptive Moment Estimation)", "AdaGrad", "L-BFGS"],
        c: 1
      },
      {
        q: "What is the vanishing gradient problem in deep neural networks?",
        a: ["Gradients becoming infinitely large during backpropagation, causing crashes", "Gradients shrinking exponentially as they propagate back, stopping training in early layers", "Loss function oscillating around local minima", "Data values getting clipped to zero inside input matrices"],
        c: 1
      },
      {
        q: "What does the term 'Epoch' mean in deep learning?",
        a: ["One forward and backward pass of a single batch of data", "One full pass of the entire training dataset through the neural network", "The total runtime taken to train a model fully", "A hyperparameter to control neural network depth"],
        c: 1
      },
      {
        q: "In Convolutional Neural Networks (CNNs), what is the primary function of a Pooling layer?",
        a: ["To increase the number of feature channels", "To reduce the spatial size of representation, reducing parameters and computation", "To apply non-linear activations to output filters", "To flatten matrices to a single dense vector"],
        c: 1
      },
      {
        q: "What is the primary objective of training a Generative Adversarial Network (GAN)?",
        a: ["To minimize classification error on tabular datasets", "A minimax game between a Generator producing fake data and a Discriminator identifying it", "To find the optimal clustering path of image matrices", "To predict continuous timeseries signals in cloud systems"],
        c: 1
      },
      {
        q: "Which model is commonly used to generate dense vector representations (embeddings) of words capturing semantic meanings?",
        a: ["Word2Vec", "Decision Trees", "K-Nearest Neighbors (KNN)", "Linear Discriminant Analysis (LDA)"],
        c: 0
      },
      {
        q: "What is 'Transfer Learning' in AI?",
        a: ["Moving a trained model from a local machine to a cloud cluster", "Using a model pre-trained on a large dataset as a starting point for a different, related task", "Converting a neural network to run on mobile devices", "Translating code from Python to C++ for faster execution"],
        c: 1
      }
    ]
  },
  data_analytics: {
    title: "Data Analytics & BI",
    icon: Database,
    color: "#949CC5",
    questions: [
      {
        q: "Which SQL clause is used to filter aggregated group results after aggregation has been performed?",
        a: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
        c: 1
      },
      {
        q: "In data modeling, what is the key characteristic of a 'Star Schema'?",
        a: ["Highly normalized tables connected sequentially", "A central fact table surrounded by simplified dimension tables", "Multiple fact tables connected through shared dimensions", "A database structure with no primary keys"],
        c: 1
      },
      {
        q: "What is the difference between an INNER JOIN and a LEFT JOIN in SQL?",
        a: ["INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table plus matches", "INNER JOIN returns all rows; LEFT JOIN returns only left matches", "LEFT JOIN is faster than INNER JOIN in all databases", "There is no difference in modern SQL engines"],
        c: 0
      },
      {
        q: "In Power BI, what is 'DAX' (Data Analysis Expressions) used for?",
        a: ["To clean data in the Power Query editor", "To write custom formulas, calculations, and measures", "To design custom visual graphics", "To schedule automatic dashboard refreshes"],
        c: 1
      },
      {
        q: "What is a 'Data Warehouse' primarily optimized for compared to an OLTP database?",
        a: ["High-frequency transaction processing and inserts", "Complex analytical queries, aggregations, and business reporting (OLAP)", "Storing unstructured audio and video files", "Hosting real-time web socket connections"],
        c: 1
      },
      {
        q: "Which aggregation function calculates the middle value in a sorted dataset?",
        a: ["MEAN", "MEDIAN", "MODE", "AVG"],
        c: 1
      },
      {
        q: "In relational databases, what does the ACID acronym stand for?",
        a: ["Accuracy, Completeness, Integrity, Durability", "Atomicity, Consistency, Isolation, Durability", "Algorithm, Computation, Indexes, Distribution", "Aggregation, Compression, Indexing, Delivery"],
        c: 1
      },
      {
        q: "What is the purpose of 'Data Normalization'?",
        a: ["To duplicate tables to increase backup speeds", "To organize tables to minimize redundancy and dependency (anomalies)", "To convert all text columns to uppercase", "To prepare charts in reporting suites"],
        c: 1
      },
      {
        q: "Which visual is best suited for showing the correlation between two continuous numeric variables?",
        a: ["Bar Chart", "Scatter Plot", "Pie Chart", "Line Chart"],
        c: 1
      },
      {
        q: "What does the SQL window function ROW_NUMBER() OVER(PARTITION BY category ORDER BY score DESC) do?",
        a: ["Groups the rows by category and sums their scores", "Assigns a sequential rank number to rows within each category, ordered by score", "Filters out duplicate categories", "Calculates the average score for each category"],
        c: 1
      }
    ]
  },
  software_eng: {
    title: "Software Engineering & Web",
    icon: Code2,
    color: "#9CAF88",
    questions: [
      {
        q: "What is the primary benefit of React's 'Virtual DOM'?",
        a: ["It replaces the browser completely", "It computes differences in memory and batches updates to the real DOM for efficiency", "It stores all component states in localStorage", "It compiles JavaScript directly to assembly code"],
        c: 1
      },
      {
        q: "In modern JavaScript, what is the difference between double equals (==) and triple equals (===)?",
        a: ["=== checks both value and type equality; == performs automatic type coercion before comparing", "== checks both value and type; === only checks values", "=== is for strict strings; == is for numeric variables", "They are identical in ES6 onwards"],
        c: 0
      },
      {
        q: "Which hook is used in React to perform side effects (such as fetching data or setting timers)?",
        a: ["useState", "useContext", "useEffect", "useMemo"],
        c: 2
      },
      {
        q: "What is the main purpose of 'state' in React components?",
        a: ["To store static global variables that never change", "An object containing data that belongs to the component and triggers re-renders when updated", "To link React directly to database tables", "To control layout margins inside CSS styles"],
        c: 1
      },
      {
        q: "Which Git command is used to record project changes in local history with a descriptive message?",
        a: ["git push", "git add", "git commit -m \"message\"", "git checkout"],
        c: 2
      },
      {
        q: "In asynchronous JavaScript, what does the await keyword do when placed before a Promise?",
        a: ["It rejects the promise automatically", "It pauses function execution until the Promise resolves or rejects, returning its result", "It sends the request in a parallel thread", "It executes a loop continuously"],
        c: 1
      },
      {
        q: "What is the worst-case time complexity of searching for an element in an unsorted array of size n?",
        a: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        c: 2
      },
      {
        q: "Which lifecycle event triggers when a React component is removed from the DOM?",
        a: ["Mounting", "Updating", "Unmounting (cleaning up side effects in useEffect return)", "Re-rendering"],
        c: 2
      },
      {
        q: "In CSS, what is the difference between standard Flexbox and CSS Grid?",
        a: ["Flexbox is 1-dimensional (row or column); CSS Grid is 2-dimensional (rows and columns simultaneously)", "Flexbox is only for mobile layouts; CSS Grid is for desktops", "Grid does not support gap properties; Flexbox does", "Flexbox requires JavaScript to calculate spacing"],
        c: 0
      },
      {
        q: "What is the correct way to pass data down to a child component in React?",
        a: ["Using State variables", "By defining Props on the child component call", "By calling local sessionStorage", "By invoking window.alert()"],
        c: 1
      }
    ]
  },
  devops: {
    title: "DevOps & Infrastructure",
    icon: Layers,
    color: "#D6A888",
    questions: [
      {
        q: "What is the primary purpose of using 'Docker' in modern software development?",
        a: ["To write unit tests in multiple languages", "To package applications and all dependencies into lightweight, isolated containers for consistent execution", "To host virtual databases in high-frequency environments", "To design interactive UI components"],
        c: 1
      },
      {
        q: "What is 'Continuous Integration' (CI) in software engineering?",
        a: ["Continuously asking users for system feedback", "Automatically building, testing, and merging code changes into a shared repository frequently", "Deploying code directly to production servers manually", "Running servers 24 hours a day without downtime"],
        c: 1
      },
      {
        q: "In cloud computing, what is the difference between 'IaaS' (Infrastructure as a Service) and 'PaaS' (Platform as a Service)?",
        a: ["IaaS provides raw infrastructure (VMs, storage); PaaS provides a managed platform to run code without OS management", "PaaS is cheaper than IaaS in all scenarios", "IaaS is only for testing; PaaS is for production", "There is no difference; they are marketing terms"],
        c: 0
      },
      {
        q: "Which command is used to build a Docker image from a local configuration file named 'Dockerfile'?",
        a: ["docker run", "docker build -t image-name .", "docker compile .", "docker image start"],
        c: 1
      },
      {
        q: "What is the primary function of 'Kubernetes' (K8s)?",
        a: ["To compile Python code to fast executables", "Container orchestration (automating deployment, scaling, and management of containerized apps)", "To host git repositories in cloud architectures", "To serve static files to web clients"],
        c: 1
      },
      {
        q: "In web security, what is the role of an SSL/TLS Certificate?",
        a: ["To speed up page loading speeds on mobile networks", "To encrypt communications between a user's web browser and the server (HTTPS)", "To block SQL Injection attacks on databases", "To authenticate user passwords locally"],
        c: 1
      },
      {
        q: "What is 'Infrastructure as Code' (IaC)?",
        a: ["Writing code inside server terminals", "Managing and provisioning server infrastructure using machine-readable configuration files (e.g. Terraform)", "Documenting hardware specifications in code files", "Compiling cloud services down to Javascript files"],
        c: 1
      },
      {
        q: "In Amazon Web Services (AWS), what is 'S3' primarily used for?",
        a: ["Running serverless lambda functions", "Simple Storage Service — highly-durable object storage for files, backups, and static assets", "Hosting relational SQL databases", "Providing high-speed virtual memory instances"],
        c: 1
      },
      {
        q: "What does the term 'Blue-Green Deployment' mean?",
        a: ["A styling method using CSS colors to label releases", "A technique to reduce deployment risk by keeping two identical production environments (one active, one idle for pre-testing)", "A testing mechanism using green for pass and blue for fail", "Updating multiple servers sequentially one by one"],
        c: 1
      },
      {
        q: "What is a 'Reverse Proxy' (e.g. Nginx)?",
        a: ["A server that sits in front of backend servers, forwarding client requests, load balancing, and handling SSL termination", "A method to browse the web anonymously", "A database layer that reverses sorting orders", "A router that blocks outgoing internet requests"],
        c: 0
      }
    ]
  }
}

export default function SkillTestPage() {
  const [profileSkills, setProfileSkills] = useState([])
  const [matchedCategory, setMatchedCategory] = useState(null)
  
  // Quiz State
  const [activeCategory, setActiveCategory] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([]) // index of selected answers
  const [quizFinished, setQuizFinished] = useState(false)

  // Load user profile skills to pre-recommend a test category
  useEffect(() => {
    try {
      const resultsStr = sessionStorage.getItem('analysisResults')
      if (resultsStr) {
        const results = JSON.parse(resultsStr)
        const allSkills = [
          ...(results.skills?.technical_skills || []),
          ...(results.skills?.frameworks || []),
          ...(results.skills?.databases || [])
        ].map(s => s.toLowerCase())
        
        setProfileSkills(allSkills)

        // Basic heuristic to match active category
        if (allSkills.some(s => s.includes('react') || s.includes('javascript') || s.includes('node') || s.includes('html') || s.includes('css') || s.includes('web'))) {
          setMatchedCategory('software_eng')
        } else if (allSkills.some(s => s.includes('tensor') || s.includes('deep learning') || s.includes('pytorch') || s.includes('nlp') || s.includes('neural'))) {
          setMatchedCategory('ai_ml')
        } else if (allSkills.some(s => s.includes('pandas') || s.includes('numpy') || s.includes('machine learning') || s.includes('scikit'))) {
          setMatchedCategory('data_science')
        } else if (allSkills.some(s => s.includes('sql') || s.includes('power bi') || s.includes('dax') || s.includes('tableau') || s.includes('analytics'))) {
          setMatchedCategory('data_analytics')
        } else if (allSkills.some(s => s.includes('docker') || s.includes('kubernetes') || s.includes('aws') || s.includes('devops') || s.includes('cicd') || s.includes('git'))) {
          setMatchedCategory('devops')
        }
      }
    } catch (e) {
      console.error("Failed to parse profile skills", e)
    }
  }, [])

  // Start the Quiz
  const startQuiz = (categoryKey) => {
    const pool = QUIZ_POOLS[categoryKey]
    if (!pool) return

    // Clone and shuffle/select 10 questions (in this case, all pools have exactly 10 questions)
    const shuffled = [...pool.questions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setActiveCategory(categoryKey)
    setAnswers(new Array(shuffled.length).fill(null))
    setCurrentIdx(0)
    setQuizStarted(true)
    setQuizFinished(false)
  }

  const handleSelectAnswer = (optionIdx) => {
    const updated = [...answers]
    updated[currentIdx] = optionIdx
    setAnswers(updated)
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      setQuizFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    }
  }

  const handleReset = () => {
    setQuizStarted(false)
    setQuizFinished(false)
    setActiveCategory(null)
    setQuestions([])
    setAnswers([])
    setCurrentIdx(0)
  }

  // Calculate score
  const score = answers.reduce((acc, ans, i) => {
    if (ans === questions[i]?.c) return acc + 1
    return acc
  }, 0)

  // Feedback based on score
  const getFeedback = (scoreVal) => {
    if (scoreVal >= 9) return { label: "Expert!", desc: "Outstanding understanding of this technology. You display senior level competence.", color: "text-neon-green" }
    if (scoreVal >= 7) return { label: "Advanced", desc: "Strong competence with very minor knowledge gaps. Excellent work!", color: "text-cyber-cyan" }
    if (scoreVal >= 5) return { label: "Intermediate", desc: "Solid foundation. Review your mistakes to strengthen missing skills.", color: "text-neon-amber" }
    return { label: "Learning", desc: "A great start. We recommend studying missing skill areas and retaking the test.", color: "text-neon-red" }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container-app max-w-3xl">
        
        {/* State 1: Intro / Setup Page */}
        {!quizStarted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyber-cyan/[0.06] border border-cyber-cyan/15 mb-4">
                <Award className="w-7 h-7 text-cyber-cyan" />
              </div>
              <h1 className="text-3xl font-bold text-text-white mb-2">AI Technical Assessment</h1>
              <p className="text-text-mid max-w-md mx-auto text-sm leading-relaxed">
                Test your knowledge in specialized technologies. Complete 10 multiple-choice exercises and receive your instant career readiness score.
              </p>
            </div>

            {/* Smart Profile recommendation */}
            {matchedCategory && (
              <div className="glass-card p-5 border-cyber-cyan/15 mb-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyber-cyan/[0.06] text-cyber-cyan mt-0.5">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-white text-sm">Custom Assessment Ready</h3>
                  <p className="text-xs text-text-mid leading-relaxed mt-1 mb-3">
                    Based on the skills analyzed in your career profile, we recommend taking the <span className="font-semibold text-cyber-cyan">{QUIZ_POOLS[matchedCategory].title}</span> test.
                  </p>
                  <button
                    onClick={() => startQuiz(matchedCategory)}
                    className="btn-primary !py-2 !px-5 text-xs flex items-center gap-2"
                  >
                    Take Recommended Test <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* All categories selector */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-text-light uppercase tracking-wider mb-2">
                {matchedCategory ? "Or Choose Another Topic" : "Choose a Assessment Topic"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(QUIZ_POOLS).map(([key, pool]) => {
                  const Icon = pool.icon
                  return (
                    <div
                      key={key}
                      onClick={() => startQuiz(key)}
                      className="glass-card p-4 hover:border-white/[0.08] cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105"
                          style={{ background: `${pool.color}08`, borderColor: `${pool.color}15` }}>
                          <Icon className="w-5 h-5" style={{ color: pool.color }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-text-white group-hover:text-cyber-cyan transition-colors">{pool.title}</h3>
                          <p className="text-[11px] text-text-dim mt-0.5">10 Questions · QCM</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-cyber-cyan transition-colors" />
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* State 2: Quiz Running */}
        {quizStarted && !quizFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-text-dim hover:text-text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Cancel Quiz
              </button>
              <span className="text-xs font-bold font-mono text-cyber-cyan">
                {QUIZ_POOLS[activeCategory].title}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-text-mid mb-2 font-mono">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                <motion.div
                  className="h-full bg-cyber-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-6 md:p-8 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-text-white mb-6 leading-relaxed">
                {questions[currentIdx]?.q}
              </h2>
              
              <div className="space-y-3">
                {questions[currentIdx]?.a.map((option, idx) => {
                  const isSelected = answers[currentIdx] === idx
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`
                        p-4 rounded-xl border text-sm transition-all duration-200 cursor-pointer flex items-center justify-between
                        ${isSelected 
                          ? 'bg-cyber-cyan/[0.08] border-cyber-cyan text-text-white font-medium' 
                          : 'bg-white/[0.01] border-white/[0.04] text-text-mid hover:bg-white/[0.03] hover:border-white/[0.08] hover:text-text-light'
                        }
                      `}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                        isSelected ? 'border-cyber-cyan bg-cyber-cyan text-black' : 'border-text-dim/40'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quiz Navigation */}
            <div className="flex items-center justify-between">
              <button
                disabled={currentIdx === 0}
                onClick={handlePrev}
                className="btn-secondary !py-2.5 !px-5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                disabled={answers[currentIdx] === null}
                onClick={handleNext}
                className="btn-primary !py-2.5 !px-6 text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentIdx === questions.length - 1 ? "Submit Answers" : "Next Question"}
                {currentIdx !== questions.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}

        {/* State 3: Score & Complete page */}
        {quizFinished && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-card p-8 text-center mb-6">
              <div className="flex justify-center mb-5">
                <MatchRing percentage={score * 10} size={85} strokeWidth={5} />
              </div>
              <h2 className="text-2xl font-bold text-text-white mb-2">Quiz Complete!</h2>
              <div className={`text-xl font-bold font-mono tracking-wide uppercase ${getFeedback(score).color} mb-3`}>
                Score: {score} / 10 · {getFeedback(score).label}
              </div>
              <p className="text-sm text-text-mid max-w-md mx-auto leading-relaxed mb-6">
                {getFeedback(score).desc}
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => startQuiz(activeCategory)}
                  className="btn-secondary !py-2.5 !px-5 text-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Test
                </button>
                <button
                  onClick={handleReset}
                  className="btn-primary !py-2.5 !px-6 text-xs flex items-center gap-2"
                >
                  Choose New Topic <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-text-light uppercase tracking-wider">
                Question Review
              </h3>
              
              {questions.map((qItem, i) => {
                const userAns = answers[i]
                const correctAns = qItem.c
                const isCorrect = userAns === correctAns
                
                return (
                  <div key={i} className="glass-card p-5 text-left border-white/[0.03]">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold font-mono text-text-dim mt-0.5">#{i+1}</span>
                      <p className="text-sm text-text-white font-medium leading-relaxed flex-grow">{qItem.q}</p>
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neon-green bg-neon-green/[0.06] py-0.5 px-2 rounded-lg border border-neon-green/10 uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neon-red bg-neon-red/[0.06] py-0.5 px-2 rounded-lg border border-neon-red/10 uppercase">
                            <AlertCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2 pl-4 border-l border-white/[0.04] text-xs">
                      <div>
                        <span className="text-text-dim mr-2">Your answer:</span>
                        <span className={isCorrect ? "text-neon-green font-medium" : "text-neon-red font-medium"}>
                          {qItem.a[userAns]}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="text-text-dim mr-2">Correct answer:</span>
                          <span className="text-neon-green font-medium">{qItem.a[correctAns]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
        
      </div>
    </div>
  )
}
