# SCTR
# DREWGRIFFITH15 (C) 2015

declare lower;

input SMA200 = 200;
input ROC125 = 125;
input SMA50 = 50;
input ROC20 = 20;
input PPO_HIST = 3;
input RSI = 14;
input LT_WEIGHT = .30;
input MD_WEIGHT = .15;
input SH_WEIGHT = .05;
input SR_LENGTH = 40;

# THIS STUDY IS A REPLICATION OF STOCKCHARTS TECHNICAL RANKING
# http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:sctr

#Long-Term Indicators (weighting)
#  * Percent above/below 200-day SMA (30%)
#  * 125-Day Rate-of-Change (30%)

def SM200 = SimpleMovingAvg(close, SMA200);
def LTSMA = ((close - SM200) / ((close + SM200) / 2));
def LTROC = RateOfChange(ROC125, close);
def LT = (LTSMA + LTROC) * LT_WEIGHT;

#Medium-Term Indicators (weighting)
#  * Percent above/below 50-day SMA  (15%)
#  * 20-day Rate-of-Change (15%)

def SM50 = SimpleMovingAvg(close, SMA50);
def MDSMA = ((close - SM50) / ((close + SM50) / 2));
def MDROC = RateOfChange(ROC20, close);
def MD = (MDSMA + MDROC) * MD_WEIGHT;

#Short-Term Indicators (weighting)
#  * 3-day slope of PPO-Histogram (5%)
#  * 14-day RSI (5%)

def EMA12 = MovAvgExponential(close, 12);
def EMA26 = MovAvgExponential(close, 26);
#def MACD = EMA12 - EMA26;
def PPO = (EMA12 - EMA26) / EMA26 * 100;
def PPOlinear = 6 * ( WMA(PPO, 3) -  Average(PPO, 3)) / (3 - 1);

# Mutliplier to get values between 0-100

def PPOdiff = PPOlinear - PPOlinear[1];
def NetChgAvg = SimpleMovingAvg(PPOdiff, 3);
def TotChgAvg = SimpleMovingAvg(AbsValue(PPOdiff), 3);
def ChgRatio = If(TotChgAvg != 0, (NetChgAvg / TotChgAvg), 0);

def SHPPO = Round(50 * (ChgRatio + 1), 3) / 100;
def SHRSI = reference RSI();
def SH = (SHPPO + SHRSI) * SH_WEIGHT;

def TR = Round(LT + MD + SH, NUMBEROFDIGITS = 1);

plot SCTR = if IsNaN(TR) then 0 else TR;

plot LONG_SR_HIGH = Round(Highest(SCTR, LENGTH = SR_LENGTH), NUMBEROFDIGITS = 1);

plot LONG_SR_LOW = Round(Lowest(SCTR, LENGTH = SR_LENGTH), NUMBEROFDIGITS = 1);

plot ZERO = 0;

SCTR.AssignValueColor(if SCTR >= ZERO then Color.GREEN else Color.RED);
SCTR.SetLineWeight(1);
SCTR.SetStyle(Curve.POINTS);

ZERO.AssignValueColor(if SCTR >= ZERO then Color.GREEN else Color.RED);
ZERO.SetLineWeight(3);
ZERO.SetStyle(Curve.POINTS);
ZERO.Hide();

LONG_SR_HIGH.SetDefaultColor(Color.CYAN);
#LONG_SR_HIGH.SetStyle(Curve.SHORT_DASH);
LONG_SR_HIGH.SetLineWeight(1);
LONG_SR_HIGH.Hide();

LONG_SR_LOW.SetDefaultColor(Color.CYAN);
#LONG_SR_LOW.SetStyle(Curve.SHORT_DASH);
LONG_SR_LOW.SetLineWeight(1);
LONG_SR_LOW.Hide();

### $$$ ###