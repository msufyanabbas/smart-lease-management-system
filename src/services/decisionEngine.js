import { supabase } from './supabase';
import decisionRulesConfig from '../data/decisionRules.json';

export const executeDecisionRules = async () => {
  const startTime = Date.now();
  const results = [];
  
  try {
    const enabledRules = Object.entries(decisionRulesConfig.decisionRules)
      .filter(([_, config]) => config.enabled);
    
    for (const [ruleName, ruleConfig] of enabledRules) {
      
      try {
        const ruleResults = await processRuleCategory(ruleName, ruleConfig);
        results.push(...ruleResults);
      } catch (error) {
        console.error(`Error processing rule ${ruleName}:`, error);
        results.push({
          rule_name: ruleName,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      execution_time_ms: executionTime,
      results,
      total_actions: results.length,
      successful_actions: results.filter(r => r.success).length
    };
    
  } catch (error) {
    console.error('Decision engine execution failed:', error);
    return {
      success: false,
      error: error.message,
      execution_time_ms: Date.now() - startTime
    };
  }
};


const processRuleCategory = async (ruleName, ruleConfig) => {
  const results = [];
  
  switch (ruleName) {
    case 'leaseRequestPriority':
      return await processLeaseRequestPriority(ruleConfig);
    
    case 'paymentMonitoring':
      return await processPaymentMonitoring(ruleConfig);
    
    case 'contractManagement':
      return await processContractManagement(ruleConfig);
    
    case 'siteOptimization':
      return await processSiteOptimization(ruleConfig);
    
    case 'clientManagement':
      return await processClientManagement(ruleConfig);
    
    case 'operationalEfficiency':
      return await processOperationalEfficiency(ruleConfig);
    
    default:
      console.log(`Unknown rule category: ${ruleName}`);
      return [];
  }
};


const processLeaseRequestPriority = async (ruleConfig) => {
  const results = [];
  
  try {
    const { data: leaseRequests, error } = await supabase
      .from('lease_requests')
      .select(`
        *,
        clients(*),
        operations_sites(*)
      `)
      .in('status', ['new', 'under_review']);
    
    if (error) throw error;
    
    for (const request of leaseRequests) {
      let priorityScore = request.priority_score || 5.0;
      let actionsApplied = [];
      
      const highValueRule = ruleConfig.conditions.find(c => c.rule === 'high_value_client');
      if (highValueRule && 
          request.clients.payment_history_score >= 8.0 && 
          request.clients.previous_leases >= 2) {
        
        priorityScore += highValueRule.parameters.priority_boost;
        actionsApplied.push('high_value_client_boost');
        
        if (priorityScore >= highValueRule.parameters.auto_approve_threshold) {
          await supabase
            .from('lease_requests')
            .update({ status: 'approved' })
            .eq('request_id', request.request_id);
          
          actionsApplied.push('auto_approved');
        }
      }
      
      const premiumLocationRule = ruleConfig.conditions.find(c => c.rule === 'premium_location');
      if (premiumLocationRule && request.operations_sites.location_premium >= 20.0) {
        priorityScore += premiumLocationRule.parameters.priority_boost;
        actionsApplied.push('premium_location_boost');
      }
      
      const longTermRule = ruleConfig.conditions.find(c => c.rule === 'long_term_lease');
      if (longTermRule && request.requested_duration_months >= 24) {
        priorityScore += longTermRule.parameters.priority_boost;
        actionsApplied.push('long_term_lease_boost');
      }
      
      const highDemandRule = ruleConfig.conditions.find(c => c.rule === 'high_demand_zone');
      if (highDemandRule && request.operations_sites.demand_factor >= 1.2) {
        priorityScore += highDemandRule.parameters.priority_boost;
        actionsApplied.push('high_demand_zone_boost');
        
        const reviewDeadline = new Date();
        reviewDeadline.setHours(reviewDeadline.getHours() + highDemandRule.parameters.review_deadline_hours);
        
        await supabase
          .from('lease_requests')
          .update({ 
            priority_score: Math.min(priorityScore, 10.0),
            review_deadline: reviewDeadline.toISOString()
          })
          .eq('request_id', request.request_id);
      }
      
      if (actionsApplied.length > 0) {
        await supabase
          .from('lease_requests')
          .update({ priority_score: Math.min(priorityScore, 10.0) })
          .eq('request_id', request.request_id);
        
        await logDecisionAction(
          'lease_request_priority',
          'lease_request',
          request.request_id,
          actionsApplied.join(', '),
          `Priority updated from ${request.priority_score} to ${Math.min(priorityScore, 10.0)}`
        );
        
        results.push({
          rule_name: 'lease_request_priority',
          entity_id: request.request_id,
          actions_applied: actionsApplied,
          old_priority: request.priority_score,
          new_priority: Math.min(priorityScore, 10.0),
          success: true
        });
      }
    }
    
  } catch (error) {
    console.error('Error processing lease request priority:', error);
    results.push({
      rule_name: 'lease_request_priority',
      success: false,
      error: error.message
    });
  }
  
  return results;
};


const processPaymentMonitoring = async (ruleConfig) => {
  const results = [];
  
  try {
    const { data: overduePayments, error } = await supabase
      .from('rent_payments')
      .select(`
        *,
        lease_contracts(*),
        lease_contracts.lease_requests(*),
        lease_contracts.lease_requests.clients(*)
      `)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString());
    
    if (error) throw error;
    
    for (const payment of overduePayments) {
      const overdueDays = Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24));
      let actionsApplied = [];
      
      if (overdueDays >= 3) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'payment_overdue_3_days');
        if (rule) {
          await sendNotification(
            'payment_overdue',
            'Payment Reminder - 3 Days Overdue',
            `Payment of ${payment.amount} SAR is now 3 days overdue`,
            payment.lease_contracts.lease_requests.clients.contact_info?.email,
            rule.parameters.template
          );
          actionsApplied.push('3_day_reminder_sent');
        }
      }
      
      if (overdueDays >= 7) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'payment_overdue_7_days');
        if (rule) {
          if (rule.parameters.add_late_fee) {
            const lateFee = payment.amount * (rule.parameters.late_fee_percentage / 100);
            await supabase
              .from('rent_payments')
              .update({ late_fee: lateFee })
              .eq('payment_id', payment.payment_id);
            
            actionsApplied.push('late_fee_added');
          }
          
          await sendNotification(
            'payment_overdue',
            'Payment Overdue - 7 Days',
            `Payment of ${payment.amount} SAR is now 7 days overdue. Late fee applied.`,
            payment.lease_contracts.lease_requests.clients.contact_info?.email,
            rule.parameters.template
          );
          actionsApplied.push('7_day_escalation_sent');
        }
      }
      
      if (overdueDays >= 14) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'payment_overdue_14_days');
        if (rule) {
          if (rule.parameters.flag_for_termination) {
            await supabase
              .from('lease_contracts')
              .update({ 
                status: 'at_risk',
                termination_flag: true 
              })
              .eq('contract_id', payment.contract_id);
            
            actionsApplied.push('flagged_for_termination');
          }
          
          await sendNotification(
            'payment_overdue',
            'Legal Notice - Payment Overdue',
            `Payment of ${payment.amount} SAR is now 14 days overdue. Legal action may be taken.`,
            payment.lease_contracts.lease_requests.clients.contact_info?.email,
            rule.parameters.template
          );
          actionsApplied.push('legal_notice_sent');
        }
      }
      
      if (actionsApplied.length > 0) {
        await logDecisionAction(
          'payment_monitoring',
          'rent_payment',
          payment.payment_id,
          actionsApplied.join(', '),
          `Payment ${overdueDays} days overdue`
        );
        
        results.push({
          rule_name: 'payment_monitoring',
          entity_id: payment.payment_id,
          actions_applied: actionsApplied,
          overdue_days: overdueDays,
          success: true
        });
      }
    }
    
  } catch (error) {
    console.error('Error processing payment monitoring:', error);
    results.push({
      rule_name: 'payment_monitoring',
      success: false,
      error: error.message
    });
  }
  
  return results;
};


const processContractManagement = async (ruleConfig) => {
  const results = [];
  
  try {
    const { data: expiringContracts, error } = await supabase
      .from('lease_contracts')
      .select(`
        *,
        lease_requests(*),
        lease_requests.clients(*)
      `)
      .eq('status', 'active')
      .lte('end_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) throw error;
    
    for (const contract of expiringContracts) {
      const daysUntilExpiry = Math.floor((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      let actionsApplied = [];
      
      if (daysUntilExpiry <= 90 && daysUntilExpiry > 30) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'contract_expiry_90_days');
        if (rule) {
          await sendNotification(
            'contract_deadline',
            'Contract Renewal Notice - 90 Days',
            `Your lease contract expires on ${contract.end_date}. Please contact us to discuss renewal options.`,
            contract.lease_requests.clients.contact_info?.email,
            rule.parameters.template
          );
          actionsApplied.push('90_day_renewal_notice');
        }
      }
      
      if (daysUntilExpiry <= 30) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'contract_expiry_30_days');
        if (rule) {
          await sendNotification(
            'contract_deadline',
            'URGENT: Contract Renewal Notice - 30 Days',
            `Your lease contract expires in ${daysUntilExpiry} days. Immediate action required.`,
            contract.lease_requests.clients.contact_info?.email,
            rule.parameters.template
          );
          actionsApplied.push('30_day_urgent_notice');
        }
      }
      
      if (actionsApplied.length > 0) {
        await logDecisionAction(
          'contract_management',
          'lease_contract',
          contract.contract_id,
          actionsApplied.join(', '),
          `Contract expires in ${daysUntilExpiry} days`
        );
        
        results.push({
          rule_name: 'contract_management',
          entity_id: contract.contract_id,
          actions_applied: actionsApplied,
          days_until_expiry: daysUntilExpiry,
          success: true
        });
      }
    }
    
    const { data: unsignedContracts, error: unsignedError } = await supabase
      .from('lease_contracts')
      .select('*')
      .eq('status', 'pending_signature')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (unsignedError) throw unsignedError;
    
    for (const contract of unsignedContracts) {
      const rule = ruleConfig.conditions.find(c => c.rule === 'unsigned_contract_7_days');
      if (rule) {
        await sendNotification(
          'contract_deadline',
          'Contract Signature Follow-up',
          `Your lease contract has been pending signature for 7 days. Please sign to proceed.`,
          'manager@boulevardworld.sa', // Manager notification
          rule.parameters.template
        );
        
        await logDecisionAction(
          'contract_management',
          'lease_contract',
          contract.contract_id,
          'signature_followup',
          'Contract unsigned for 7+ days'
        );
        
        results.push({
          rule_name: 'contract_management',
          entity_id: contract.contract_id,
          actions_applied: ['signature_followup'],
          success: true
        });
      }
    }
    
  } catch (error) {
    console.error('Error processing contract management:', error);
    results.push({
      rule_name: 'contract_management',
      success: false,
      error: error.message
    });
  }
  
  return results;
};


const processSiteOptimization = async (ruleConfig) => {
  const results = [];
  
  try {
    const { data: vacantSites, error } = await supabase
      .from('operations_sites')
      .select('*')
      .eq('status', 'vacant');
    
    if (error) throw error;
    
    for (const site of vacantSites) {
      let actionsApplied = [];
      
      if (site.demand_factor >= 1.3) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'high_demand_pricing');
        if (rule) {
          const newPrice = site.current_price_per_sqm * (1 + rule.parameters.price_increase_percentage / 100);
          const cappedPrice = Math.min(newPrice, rule.parameters.max_price_ceiling);
          
          await supabase
            .from('operations_sites')
            .update({ current_price_per_sqm: cappedPrice })
            .eq('site_id', site.site_id);
          
          actionsApplied.push('price_increased');
        }
      }
      
      if (site.demand_factor <= 0.8) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'low_demand_pricing');
        if (rule) {
          const vacantDays = Math.floor((new Date() - new Date(site.created_at)) / (1000 * 60 * 60 * 24));
          if (vacantDays >= 60) {
            const newPrice = site.current_price_per_sqm * (1 - rule.parameters.price_decrease_percentage / 100);
            const flooredPrice = Math.max(newPrice, rule.parameters.min_price_floor);
            
            await supabase
              .from('operations_sites')
              .update({ current_price_per_sqm: flooredPrice })
              .eq('site_id', site.site_id);
            
            actionsApplied.push('price_decreased');
          }
        }
      }
      
      const vacantDays = Math.floor((new Date() - new Date(site.created_at)) / (1000 * 60 * 60 * 24));
      if (vacantDays >= 90) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'vacant_site_promotion');
        if (rule) {
          const promotionEndDate = new Date();
          promotionEndDate.setDate(promotionEndDate.getDate() + rule.parameters.promotion_duration_days);
          
          actionsApplied.push('promotion_created');
        }
      }
      
      if (actionsApplied.length > 0) {
        await logDecisionAction(
          'site_optimization',
          'operations_site',
          site.site_id,
          actionsApplied.join(', '),
          `Site vacant for ${vacantDays} days`
        );
        
        results.push({
          rule_name: 'site_optimization',
          entity_id: site.site_id,
          actions_applied: actionsApplied,
          vacant_days: vacantDays,
          success: true
        });
      }
    }
    
  } catch (error) {
    console.error('Error processing site optimization:', error);
    results.push({
      rule_name: 'site_optimization',
      success: false,
      error: error.message
    });
  }
  
  return results;
};


const processClientManagement = async (ruleConfig) => {
  const results = [];
  
  try {
    const { data: newClients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('previous_leases', 0)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) throw error;
    
    for (const client of newClients) {
      const rule = ruleConfig.conditions.find(c => c.rule === 'new_client_onboarding');
      if (rule) {
        await sendNotification(
          'client_welcome',
          'Welcome to Boulevard World',
          `Welcome ${client.client_name}! We're excited to have you join our community.`,
          client.contact_info?.email,
          rule.parameters.template
        );
        
        await logDecisionAction(
          'client_management',
          'client',
          client.client_id,
          'welcome_package_sent',
          'New client onboarding'
        );
        
        results.push({
          rule_name: 'client_management',
          entity_id: client.client_id,
          actions_applied: ['welcome_package_sent'],
          success: true
        });
      }
    }
    
  } catch (error) {
    console.error('Error processing client management:', error);
    results.push({
      rule_name: 'client_management',
      success: false,
      error: error.message
    });
  }
  
  return results;
};


const processOperationalEfficiency = async (ruleConfig) => {
  const results = [];
  
  try {
    const { data: insights, error } = await supabase
      .from('operational_insights')
      .select('*')
      .order('date', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (insights.length > 0) {
      const currentInsights = insights[0];
      
      if (currentInsights.occupancy_rate < 60.0) {
        const rule = ruleConfig.conditions.find(c => c.rule === 'low_occupancy_alert');
        if (rule) {
          await sendNotification(
            'operational_alert',
            'Low Occupancy Alert',
            `Current occupancy rate is ${currentInsights.occupancy_rate}%. Marketing campaign recommended.`,
            'manager@boulevardworld.sa',
            'low_occupancy_alert'
          );
          
          await logDecisionAction(
            'operational_efficiency',
            'operational_insight',
            currentInsights.insight_id,
            'low_occupancy_alert',
            `Occupancy rate: ${currentInsights.occupancy_rate}%`
          );
          
          results.push({
            rule_name: 'operational_efficiency',
            entity_id: currentInsights.insight_id,
            actions_applied: ['low_occupancy_alert'],
            occupancy_rate: currentInsights.occupancy_rate,
            success: true
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error processing operational efficiency:', error);
    results.push({
      rule_name: 'operational_efficiency',
      success: false,
      error: error.message
    });
  }
  
  return results;
};


const sendNotification = async (type, title, message, recipientEmail, template) => {
  try {
    await supabase
      .from('notifications')
      .insert({
        type,
        title,
        message,
        recipient_email: recipientEmail,
        status: 'pending'
      });
    
    console.log(`Notification sent: ${title} to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};


const logDecisionAction = async (ruleName, entityType, entityId, actionTaken, result) => {
  try {
    await supabase
      .from('decision_log')
      .insert({
        rule_name: ruleName,
        entity_type: entityType,
        entity_id: entityId,
        action_taken: actionTaken,
        result,
        execution_time_ms: 0 
      });
    
    console.log(`Decision logged: ${ruleName} - ${actionTaken}`);
  } catch (error) {
    console.error('Error logging decision:', error);
  }
};


export const getDecisionEngineStatus = async () => {
  try {
    const { data: recentLogs, error } = await supabase
      .from('decision_log')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActions = recentLogs.filter(log => new Date(log.executed_at) > last24Hours);
    
    return {
      status: 'active',
      last_execution: recentLogs[0]?.executed_at,
      actions_last_24h: recentActions.length,
      total_actions: recentLogs.length,
      recent_actions: recentActions.slice(0, 10)
    };
    
  } catch (error) {
    console.error('Error getting decision engine status:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
};

export default {
  executeDecisionRules,
  getDecisionEngineStatus
};